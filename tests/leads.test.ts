import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleLeadRequest, leadEmail, leadSchema, resetRateLimit, sellerAirtableFields, toLead } from "@/lib/leads";
import { normalizePhone } from "@/lib/lead-options";
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
  startedAt: 0,
};

const request = (body: unknown, ip?: string) => jsonRequest("/api/leads", body, ip);

beforeEach(() => {
  resetRateLimit();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("normalizePhone", () => {
  it.each([
    ["7805550199", "(780) 555-0199"],
    ["(780) 555-0199", "(780) 555-0199"],
    ["+1 780.555.0199", "(780) 555-0199"],
    ["1-587-555-0199", "(587) 555-0199"],
  ])("formats %s", (input, expected) => expect(normalizePhone(input)).toBe(expected));

  it.each(["555-0199", "123-456-7890", "780-155-0199", "abc", ""])("rejects %s", (input) =>
    expect(normalizePhone(input)).toBeNull(),
  );
});

describe("leadSchema", () => {
  it("accepts a complete lead and normalizes the phone", () => {
    const parsed = leadSchema.parse(valid);
    expect(parsed.phone).toBe("(780) 555-0199");
    expect(parsed.condition).toBe("Heavy reno");
  });

  it("accepts the minimum fields", () => {
    const parsed = leadSchema.parse({ address: "9 Oak Ave", name: "Al", phone: "7805550199" });
    expect(parsed.reason).toBe("");
    expect(parsed.propertyType).toBe("");
  });

  it("rejects bad phone, email and values that aren't Airtable choices", () => {
    expect(leadSchema.safeParse({ ...valid, phone: "12345" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, condition: "Haunted" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, timeline: "Within 30 days" }).success).toBe(false);
  });
});

describe("sellerAirtableFields", () => {
  it("maps a lead onto the Seller Leads table", () => {
    const lead = toLead(leadSchema.parse(valid), "ua");
    const fields = sellerAirtableFields(lead, new Date("2026-09-26T05:00:00Z"));
    expect(fields).toMatchObject({
      "Property Address": valid.address,
      "Owner Name": "Pat Seller",
      Phone: "(780) 555-0199",
      Email: "pat@example.org",
      Status: "New",
      Source: "Inbound (web / phone / FB)",
      "Property Type": "Condo townhouse",
      Timeline: "1-3 months",
      Condition: "Heavy reno",
      Occupancy: "Tenanted",
      Motivation: "Condo fees or special assessment: Special assessment coming for new siding",
      // 05:00 UTC is still the 25th in Edmonton
      "Next Follow-Up": "2026-09-25",
    });
    expect(fields.Notes).toContain("OK to text: Yes");
    expect(fields.Notes).toContain(lead.id);
  });
});

describe("handleLeadRequest", () => {
  const webhookEnv = { LEAD_WEBHOOK_URL: "https://hooks.example.test/lead", LEAD_WEBHOOK_SECRET: "s3cret" };
  const airtableEnv = { AIRTABLE_TOKEN: "pat_test", AIRTABLE_BASE_ID: "appTEST1234567890" };

  it("creates a Seller Leads record in Airtable", async () => {
    const fetchImpl = vi.fn(ok('{"records":[{"id":"rec1"}]}'));
    const res = await handleLeadRequest(request(valid), { env: airtableEnv, fetchImpl, now: 10_000 });
    expect(res.status).toBe(200);
    expect(sentUrl(fetchImpl)).toBe("https://api.airtable.com/v0/appTEST1234567890/Seller%20Leads");
    const body = sentBody(fetchImpl);
    expect(body.typecast).toBe(true);
    expect(body.records[0].fields["Property Address"]).toBe(valid.address);
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer pat_test");
  });

  it("delivers to the webhook with the secret header", async () => {
    const fetchImpl = vi.fn(ok());
    const res = await handleLeadRequest(request(valid), { env: webhookEnv, fetchImpl, now: 10_000 });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(webhookEnv.LEAD_WEBHOOK_URL);
    expect((init.headers as Record<string, string>)["X-Webhook-Secret"]).toBe("s3cret");
    const body = sentBody(fetchImpl);
    expect(body).toMatchObject({ type: "seller_lead", address: valid.address, phone: "(780) 555-0199" });
    expect(body).not.toHaveProperty("website");
  });

  it("sends an email via Resend when configured", async () => {
    const fetchImpl = vi.fn(ok());
    const env = { RESEND_API_KEY: "re_test", LEAD_EMAIL_TO: "a@x.test, b@x.test" };
    const res = await handleLeadRequest(request(valid), { env, fetchImpl, now: 10_000 });
    expect(res.status).toBe(200);
    expect(sentUrl(fetchImpl)).toBe("https://api.resend.com/emails");
    expect(sentBody(fetchImpl).to).toEqual(["a@x.test", "b@x.test"]);
  });

  it("returns 502 when every configured destination fails", async () => {
    const res = await handleLeadRequest(request(valid), { env: webhookEnv, fetchImpl: vi.fn(fail), now: 10_000 });
    expect(res.status).toBe(502);
    expect(console.warn).toHaveBeenCalled(); // lead is logged so it isn't lost
  });

  it("succeeds when at least one destination works", async () => {
    const fetchImpl = vi.fn().mockImplementationOnce(fail).mockImplementationOnce(ok());
    const env = { LEAD_WEBHOOK_URL: "https://a.test, https://b.test" };
    const res = await handleLeadRequest(request(valid), { env, fetchImpl, now: 10_000 });
    expect(res.status).toBe(200);
  });

  it("logs the lead and succeeds when no destination is configured", async () => {
    const res = await handleLeadRequest(request(valid), { env: {}, now: 10_000 });
    expect(res.status).toBe(200);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("No delivery destination"), expect.any(String));
  });

  it("silently drops honeypot and too-fast submissions", async () => {
    const fetchImpl = vi.fn(ok());
    const honeypot = await handleLeadRequest(request({ ...valid, website: "http://spam.test" }), { env: webhookEnv, fetchImpl, now: 10_000 });
    const tooFast = await handleLeadRequest(request({ ...valid, startedAt: 9_000 }), { env: webhookEnv, fetchImpl, now: 10_000 });
    expect(honeypot.status).toBe(200);
    expect(tooFast.status).toBe(200);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns field errors for invalid input", async () => {
    const res = await handleLeadRequest(request({ ...valid, phone: "nope" }), { env: {}, now: 10_000 });
    expect(res.status).toBe(400);
    expect((await res.json()).fieldErrors).toHaveProperty("phone");
  });

  it("rejects malformed JSON", async () => {
    const res = await handleLeadRequest(request("{not json"), { env: {} });
    expect(res.status).toBe(400);
  });

  it("rate limits repeated submissions from one IP", async () => {
    const statuses = [];
    for (let i = 0; i < 6; i++) {
      statuses.push((await handleLeadRequest(request(valid, "10.9.9.9"), { env: {}, now: 10_000 })).status);
    }
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
  });
});

describe("leadEmail", () => {
  it("escapes HTML in user input and shows friendly labels", () => {
    const lead = toLead(leadSchema.parse({ ...valid, name: "<script>alert(1)</script>" }), "ua");
    const { html, subject, text } = leadEmail(lead);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(subject).toContain(valid.address);
    expect(text).toContain("Needs major work");
  });
});
