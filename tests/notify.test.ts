import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { site, type VerifiedFlag } from "@/config/site";
import { leadSchema, toLead } from "@/lib/leads";
import { afterLead, afterLeadTasks, withinTextingHours } from "@/lib/notify";
import { QUO_DEFAULT_BASE, sendQuoText } from "@/lib/notify/quo";
import { sendPush } from "@/lib/notify/ntfy";
import {
  callWindow,
  optOutAlertEmail,
  ownerAlertEmail,
  ownerPush,
  ownerText,
  sellerEmail,
  sellerText,
  buyerAlertEmail,
} from "@/lib/notify/templates";
import { buyerSchema, toBuyer } from "@/lib/buyers";
import { optOutSchema, toOptOut } from "@/lib/optouts";
import { findUnverifiedPromises } from "./banned-phrases.mjs";
import { ok, sentBody, sentUrl } from "./helpers";

const lead = toLead(
  leadSchema.parse({
    address: "1234 56 St NW, Edmonton",
    name: "Pat Seller",
    phone: "780-555-0199",
    email: "pat@example.org",
    propertyType: "Condo townhouse",
    timeline: "ASAP",
    smsConsent: true,
  }),
  "ua",
);
const quoEnv = { QUO_API_KEY: "quo_key", QUO_FROM_NUMBER: "(780) 555-0100", QUO_NOTIFY_TO: "780 555 0111" };
/** 18:00 UTC = noon in Edmonton; 06:00 UTC = midnight. */
const NOON = new Date("2026-10-05T18:00:00Z");
const MIDNIGHT = new Date("2026-10-05T06:00:00Z");

const flags = site.verified as Record<VerifiedFlag, boolean>;
const original = { ...flags };

beforeEach(() => {
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("SITE_ENV", "");
  vi.stubEnv("NEXT_PUBLIC_PREVIEW_UNCONFIRMED", "");
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  Object.assign(flags, original);
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("Quo", () => {
  it("sends the key without Bearer and `to` as an E.164 array", async () => {
    const fetchImpl = vi.fn(() => Promise.resolve(new Response("{}", { status: 202 })));
    await sendQuoText(quoEnv, fetchImpl, { to: ["+17805550111"], content: "hi" });
    expect(sentUrl(fetchImpl)).toBe(`${QUO_DEFAULT_BASE}/v1/messages`);
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe("quo_key");
    expect(sentBody(fetchImpl)).toEqual({ content: "hi", from: "+17805550100", to: ["+17805550111"] });
  });

  it("honours QUO_API_BASE and a PN… sender ID", async () => {
    const fetchImpl = vi.fn(() => Promise.resolve(new Response("{}", { status: 202 })));
    await sendQuoText({ ...quoEnv, QUO_API_BASE: "https://api.openphone.com/", QUO_FROM_NUMBER: "PNabc123" }, fetchImpl, { to: ["+17805550111"], content: "hi" });
    expect(sentUrl(fetchImpl)).toBe("https://api.openphone.com/v1/messages");
    expect(sentBody(fetchImpl).from).toBe("PNabc123");
  });

  it("throws on an error status", async () => {
    await expect(sendQuoText(quoEnv, vi.fn(() => Promise.resolve(new Response("", { status: 401 }))), { to: ["+1"], content: "x" })).rejects.toThrow(/401/);
  });
});

describe("ntfy", () => {
  it("carries no name, phone, email or address", async () => {
    const push = ownerPush(lead);
    const everything = `${push.title} ${push.body} ${push.tags}`;
    for (const personal of [lead.name, "Pat", lead.phone, "555", lead.email, lead.address, "56 St"]) expect(everything).not.toContain(personal);
    expect(push).toMatchObject({ title: "New seller lead", body: "Condo townhouse, As soon as possible. Details are in your email.", priority: "high", tags: "house" });
  });

  it("sends the title, priority and tags as headers, with the token when set", async () => {
    const fetchImpl = vi.fn(ok());
    await sendPush({ NTFY_TOPIC_URL: "https://ntfy.sh/aurora-long-random", NTFY_TOKEN: "tk" }, fetchImpl, ownerPush(lead));
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://ntfy.sh/aurora-long-random");
    expect(init.headers).toMatchObject({ Title: "New seller lead", Priority: "high", Tags: "house", Authorization: "Bearer tk" });
  });

  it("uses default priority unless the timeline is ASAP", () => {
    expect(ownerPush({ ...lead, timeline: "3-6 months" }).priority).toBe("default");
  });
});

describe("seller confirmations: the gates", () => {
  const names = (env: Record<string, string>, l = lead, now = NOON) => afterLeadTasks(l, env, vi.fn(), now).map((t) => t.name);
  const full = { ...quoEnv, SELLER_ACK_SMS: "true", RESEND_API_KEY: "re", LEAD_EMAIL_TO: "kane@test.invalid", NTFY_TOPIC_URL: "https://ntfy.sh/x" };

  it("sends everything when everything is configured and allowed", () => {
    expect(names(full)).toEqual(["owner-text", "owner-push", "seller-email", "seller-text"]);
  });

  it("texts the seller only between 08:00 and 21:00 Edmonton time", () => {
    expect(withinTextingHours(NOON)).toBe(true);
    expect(withinTextingHours(MIDNIGHT)).toBe(false);
    expect(withinTextingHours(new Date("2026-10-05T14:00:00Z"))).toBe(true); // 08:00
    expect(withinTextingHours(new Date("2026-10-06T03:00:00Z"))).toBe(false); // 21:00
    expect(names(full, lead, MIDNIGHT)).not.toContain("seller-text");
    expect(names(full, lead, MIDNIGHT)).toContain("seller-email");
  });

  it("texts the seller only with consent and SELLER_ACK_SMS=true", () => {
    expect(names(full, { ...lead, smsConsent: false })).not.toContain("seller-text");
    expect(names({ ...full, SELLER_ACK_SMS: "" })).not.toContain("seller-text");
  });

  it("emails the seller only when they gave an email, unless SELLER_ACK_EMAIL=false", () => {
    expect(names(full, { ...lead, email: "" })).not.toContain("seller-email");
    expect(names({ ...full, SELLER_ACK_EMAIL: "false" })).not.toContain("seller-email");
  });

  it("does nothing that isn't configured", () => {
    expect(names({})).toEqual([]);
  });

  it("isolates failures and logs the lead ID only", async () => {
    const fetchImpl = vi.fn(() => Promise.resolve(new Response("", { status: 500 })));
    const results = await afterLead(lead, { env: full, fetchImpl, now: NOON });
    expect(results.every((r) => !r.ok)).toBe(true);
    const logged = vi.mocked(console.error).mock.calls.map((c) => c.join(" ")).join("\n");
    expect(logged).toContain(lead.id);
    for (const personal of [lead.name, lead.phone, lead.email, lead.address]) expect(logged).not.toContain(personal);
  });
});

describe("templates", () => {
  it("owner alert: call and text links with consent, a warning without", () => {
    const withConsent = ownerAlertEmail(lead);
    expect(withConsent.subject).toBe("New lead: 1234 56 St NW, Edmonton (As soon as possible)");
    expect(withConsent.html).toContain("tel:+17805550199");
    expect(withConsent.html).toContain("Text Pat");
    expect(withConsent.html).toContain(encodeURIComponent("I got your request about 1234 56 St NW"));
    const without = ownerAlertEmail({ ...lead, smsConsent: false });
    expect(without.html).not.toContain("sms:");
    expect(without.html).toContain("No text consent. Call instead.");
  });

  it("owner alert: escapes what the seller typed", () => {
    const { html } = ownerAlertEmail({ ...lead, name: "<script>x</script>" });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("owner text: 320 characters or fewer, even with a long address", () => {
    expect(ownerText(lead)).toBe("New lead: 1234 56 St NW, Edmonton. Pat Seller (780) 555-0199. Condo townhouse, As soon as possible. OK to text: Yes.");
    expect(ownerText({ ...lead, address: "x".repeat(400) }).length).toBeLessThanOrEqual(320);
  });

  it("seller text: identifies the sender and says how to opt out", () => {
    const text = sellerText(lead);
    expect(text).toContain(`${site.founder.firstName} from ${site.name}`);
    expect(text).toContain("1234 56 St NW");
    expect(text).toContain(`I'll call you ${callWindow()} from this number`);
    expect(text).toContain("Reply STOP to opt out.");
  });

  it("seller email: sender, contact details and an opt-out", () => {
    const { subject, text } = sellerEmail(lead);
    expect(subject).toBe("Got your request, Pat");
    expect(text).toContain(site.phone);
    expect(text).toContain('reply "stop"');
    expect(text).toContain("/how-it-works");
  });

  it("opt-out email subject names the address", () => {
    const optOut = toOptOut(optOutSchema.parse({ address: "77 Birch Rd, Edmonton", channel: "Letter" }));
    expect(optOutAlertEmail(optOut).subject).toBe("Opt-out: 77 Birch Rd, Edmonton");
  });

  it("with every flag off, no template contains an unverified promise", () => {
    for (const flag of Object.keys(flags) as VerifiedFlag[]) flags[flag] = false;
    const buyer = toBuyer(buyerSchema.parse({ name: "Al", email: "al@example.org", phone: "7805550100", consent: true }), "ua");
    const optOut = toOptOut(optOutSchema.parse({ address: "77 Birch Rd, Edmonton" }));
    const all = [
      ownerAlertEmail(lead),
      sellerEmail(lead),
      buyerAlertEmail(buyer),
      optOutAlertEmail(optOut),
    ].flatMap((e) => [e.subject, e.text]);
    const text = [...all, ownerText(lead), sellerText(lead), ownerPush(lead).body].join(" ¦ ");
    expect(findUnverifiedPromises(text, flags)).toEqual([]);
    expect(sellerEmail(lead).text).toContain("after I see the place");
  });
});
