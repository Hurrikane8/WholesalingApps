import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleLeadRequest, leadSchema, resetRateLimit, toLead, UNDELIVERED_MESSAGE } from "@/lib/leads";
import { normalizePhone, toE164 } from "@/lib/lead-options";
import { sellerAirtableFields } from "@/lib/sinks/airtable";
import { fail, jsonRequest, ok, sentBody, sentUrl } from "./helpers";

const valid = {
  address: "1234 56 St NW, Edmonton",
  name: "Pat Seller",
  phone: "780-555-0199",
  email: "pat@example.org",
  propertyType: "Condo townhouse",
  condition: "Heavy reno",
  timeline: "1-3 months",
  occupancy: "Tenanted",
  reason: "Condo fees or special assessment",
  notes: "Special assessment coming for new siding",
  smsConsent: true,
  submissionId: "sub-1",
  firstTouch: { params: { utm_source: "letter", utm_campaign: "2026-10-letter" }, landingPage: "/hello", referrer: "", at: "2026-10-02T15:00:00Z" },
  lastTouch: { params: {}, landingPage: "/get-cash-offer", referrer: "https://www.google.com/", at: "2026-10-05T15:00:00Z" },
  startedAt: 0,
};

let submission = 0;
/** A fresh submissionId per request unless the test sets one. */
const request = (body: Record<string, unknown> | string, ip?: string) =>
  jsonRequest("/api/leads", typeof body === "string" ? body : { ...body, submissionId: body.submissionId === "keep" ? "same-id" : `sub-${++submission}` }, ip);

beforeEach(() => {
  resetRateLimit();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("phone numbers", () => {
  it.each([
    ["7805550199", "(780) 555-0199"],
    ["(780) 555-0199", "(780) 555-0199"],
    ["+1 780.555.0199", "(780) 555-0199"],
    ["1-587-555-0199", "(587) 555-0199"],
  ])("formats %s", (input, expected) => expect(normalizePhone(input)).toBe(expected));

  it.each(["555-0199", "123-456-7890", "780-155-0199", "abc", ""])("rejects %s", (input) => expect(normalizePhone(input)).toBeNull());

  it("converts to E.164 for texting", () => {
    expect(toE164("(780) 555-0199")).toBe("+17805550199");
    expect(toE164("nope")).toBeNull();
  });
});

describe("leadSchema", () => {
  it("accepts a complete lead and normalizes the phone", () => {
    const parsed = leadSchema.parse(valid);
    expect(parsed.phone).toBe("(780) 555-0199");
    expect(parsed.firstTouch?.params.utm_source).toBe("letter");
  });

  it("accepts the minimum fields", () => {
    const parsed = leadSchema.parse({ address: "9 Oak Ave", name: "Al", phone: "7805550199" });
    expect(parsed.reason).toBe("");
    expect(parsed.submissionId).toBeUndefined();
  });

  it("says exactly what to fix", () => {
    const result = leadSchema.safeParse({ ...valid, address: "1", phone: "12345", email: "nope" });
    expect(result.success).toBe(false);
    const messages = result.error!.issues.map((i) => i.message).join(" | ");
    expect(messages).toContain("Enter the street address and city");
    expect(messages).toContain("10-digit phone number");
    expect(messages).toContain("email");
  });

  it("rejects values that aren't Airtable choices", () => {
    expect(leadSchema.safeParse({ ...valid, condition: "Haunted" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, timeline: "Within 30 days" }).success).toBe(false);
  });
});

describe("sellerAirtableFields", () => {
  it("maps a lead onto the Seller Leads table, with attribution in Notes", () => {
    const lead = toLead(leadSchema.parse(valid), "ua");
    const fields = sellerAirtableFields(lead, new Date("2026-09-26T05:00:00Z"));
    expect(fields).toMatchObject({
      "Property Address": valid.address,
      "Owner Name": "Pat Seller",
      Phone: "(780) 555-0199",
      Status: "New",
      Source: "Inbound (web / phone / FB)",
      "Property Type": "Condo townhouse",
      Motivation: "Condo fees or special assessment: Special assessment coming for new siding",
      // 05:00 UTC is still the 25th in Edmonton
      "Next Follow-Up": "2026-09-25",
    });
    expect(fields.Notes).toContain("OK to text: Yes");
    expect(fields.Notes).toContain("First touch: landed on /hello; utm_source=letter");
    expect(fields.Notes).toContain("Last touch: landed on /get-cash-offer");
    expect(fields.Notes).toContain("Campaign: utm_source=letter");
    expect(fields.Notes).toContain(lead.id);
  });
});

describe("handleLeadRequest", () => {
  const webhookEnv = { LEAD_WEBHOOK_URL: "https://hooks.example.test/lead", LEAD_WEBHOOK_SECRET: "s3cret" };
  const airtableEnv = { AIRTABLE_TOKEN: "pat_test", AIRTABLE_BASE_ID: "appTEST1234567890" };
  const deps = (env: Record<string, string>, fetchImpl?: ReturnType<typeof vi.fn>) => ({
    env,
    fetchImpl: fetchImpl as unknown as typeof fetch,
    now: 10_000,
    defer: () => {},
  });

  it("creates a Seller Leads record in Airtable", async () => {
    const fetchImpl = vi.fn(ok('{"records":[{"id":"rec1"}]}'));
    const res = await handleLeadRequest(request(valid), deps(airtableEnv, fetchImpl));
    expect(res.status).toBe(200);
    expect(sentUrl(fetchImpl)).toBe("https://api.airtable.com/v0/appTEST1234567890/Seller%20Leads");
    expect(sentBody(fetchImpl).records[0].fields["Property Address"]).toBe(valid.address);
  });

  it("delivers to the webhook with the secret header", async () => {
    const fetchImpl = vi.fn(ok());
    const res = await handleLeadRequest(request(valid), deps(webhookEnv, fetchImpl));
    expect(res.status).toBe(200);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(webhookEnv.LEAD_WEBHOOK_URL);
    expect((init.headers as Record<string, string>)["X-Webhook-Secret"]).toBe("s3cret");
    expect(sentBody(fetchImpl)).toMatchObject({ type: "seller_lead", address: valid.address, phone: "(780) 555-0199" });
    expect(sentBody(fetchImpl)).not.toHaveProperty("website");
  });

  it("sends the owner alert email via Resend", async () => {
    const fetchImpl = vi.fn(ok());
    const res = await handleLeadRequest(request(valid), deps({ RESEND_API_KEY: "re_test", LEAD_EMAIL_TO: "a@x.test, b@x.test" }, fetchImpl));
    expect(res.status).toBe(200);
    expect(sentUrl(fetchImpl)).toBe("https://api.resend.com/emails");
    expect(sentBody(fetchImpl).to).toEqual(["a@x.test", "b@x.test"]);
    expect(sentBody(fetchImpl).subject).toBe(`New lead: ${valid.address} (Within 1–3 months)`);
  });

  it("returns 502 with the call-or-text message when every sink fails, and logs the lead once", async () => {
    const res = await handleLeadRequest(request(valid), deps(webhookEnv, vi.fn(fail)));
    expect(res.status).toBe(502);
    expect(await res.json()).toMatchObject({ ok: false, error: UNDELIVERED_MESSAGE });
    const undelivered = vi.mocked(console.error).mock.calls.filter(([m]) => String(m).startsWith("[lead:undelivered]"));
    expect(undelivered).toHaveLength(1);
    expect(String(undelivered[0][0])).toContain(valid.address);
  });

  it("returns 502 when no sink is configured outside development", async () => {
    for (const mode of ["production", "preview"] as const) {
      const res = await handleLeadRequest(request(valid), { ...deps({}), mode });
      expect(res.status).toBe(502);
    }
  });

  it("only in development, logs a warning and returns ok when nothing is configured", async () => {
    const res = await handleLeadRequest(request(valid), { ...deps({}), mode: "development" });
    expect(res.status).toBe(200);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("No lead destination"), expect.any(String));
  });

  it("succeeds when at least one sink works", async () => {
    const fetchImpl = vi.fn().mockImplementationOnce(fail).mockImplementationOnce(ok());
    const res = await handleLeadRequest(request(valid), deps({ LEAD_WEBHOOK_URL: "https://a.test, https://b.test" }, fetchImpl));
    expect(res.status).toBe(200);
  });

  it("doesn't deliver a repeated submissionId twice", async () => {
    const fetchImpl = vi.fn(ok());
    const first = await handleLeadRequest(request({ ...valid, submissionId: "keep" }), deps(webhookEnv, fetchImpl));
    const second = await handleLeadRequest(request({ ...valid, submissionId: "keep" }), deps(webhookEnv, fetchImpl));
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(await second.json()).toMatchObject({ ok: true, duplicate: true });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("lets a failed submission be retried with the same submissionId", async () => {
    const failed = await handleLeadRequest(request({ ...valid, submissionId: "keep" }), deps(webhookEnv, vi.fn(fail)));
    expect(failed.status).toBe(502);
    const fetchImpl = vi.fn(ok());
    const retry = await handleLeadRequest(request({ ...valid, submissionId: "keep" }), deps(webhookEnv, fetchImpl));
    expect(retry.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("schedules alerts and confirmations after the response", async () => {
    const defer = vi.fn();
    const res = await handleLeadRequest(request(valid), { ...deps(webhookEnv, vi.fn(ok())), defer });
    expect(res.status).toBe(200);
    expect(defer).toHaveBeenCalledTimes(1);
  });

  it("silently drops honeypot and too-fast submissions", async () => {
    const fetchImpl = vi.fn(ok());
    const honeypot = await handleLeadRequest(request({ ...valid, website: "http://spam.test" }), deps(webhookEnv, fetchImpl));
    const tooFast = await handleLeadRequest(request({ ...valid, startedAt: 8_000 }), deps(webhookEnv, fetchImpl));
    expect(honeypot.status).toBe(200);
    expect(tooFast.status).toBe(200);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns field errors for invalid input", async () => {
    const res = await handleLeadRequest(request({ ...valid, phone: "nope" }), deps({}));
    expect(res.status).toBe(400);
    expect((await res.json()).fieldErrors).toHaveProperty("phone");
  });

  it("rejects malformed JSON", async () => {
    const res = await handleLeadRequest(request("{not json"), deps({}));
    expect(res.status).toBe(400);
  });

  it("rate limits repeated submissions from one IP", async () => {
    const statuses = [];
    for (let i = 0; i < 6; i++) {
      statuses.push((await handleLeadRequest(request(valid, "10.9.9.9"), { ...deps({}), mode: "development" })).status);
    }
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
  });
});
