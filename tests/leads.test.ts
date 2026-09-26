import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleLeadRequest, leadEmail, leadSchema, resetRateLimit, toLead } from "@/lib/leads";
import { normalizePhone } from "@/lib/lead-options";

const valid = {
  address: "123 Main St, Atlanta, GA",
  name: "Pat Seller",
  phone: "404-555-0199",
  email: "pat@example.org",
  condition: "Needs major repairs",
  timeline: "Within 30 days",
  smsConsent: true,
  startedAt: 0,
};

let ipCounter = 0;
function request(body: unknown, ip = `10.0.0.${++ipCounter}`) {
  return new Request("http://localhost/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip, "user-agent": "vitest" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const ok = () => Promise.resolve(new Response("ok", { status: 200 }));
const fail = () => Promise.resolve(new Response("nope", { status: 500 }));

beforeEach(() => {
  resetRateLimit();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("normalizePhone", () => {
  it.each([
    ["4045550199", "(404) 555-0199"],
    ["(404) 555-0199", "(404) 555-0199"],
    ["+1 404.555.0199", "(404) 555-0199"],
    ["1-404-555-0199", "(404) 555-0199"],
  ])("formats %s", (input, expected) => expect(normalizePhone(input)).toBe(expected));

  it.each(["555-0199", "123-456-7890", "404-155-0199", "abc", ""])("rejects %s", (input) =>
    expect(normalizePhone(input)).toBeNull(),
  );
});

describe("leadSchema", () => {
  it("accepts a complete lead and normalizes the phone", () => {
    const parsed = leadSchema.parse(valid);
    expect(parsed.phone).toBe("(404) 555-0199");
    expect(parsed.reason).toBe("");
  });

  it("accepts the minimum fields", () => {
    expect(leadSchema.safeParse({ address: "9 Oak Ave", name: "Al", phone: "4045550199" }).success).toBe(true);
  });

  it("rejects bad phone, email and unknown options", () => {
    expect(leadSchema.safeParse({ ...valid, phone: "12345" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, condition: "Haunted" }).success).toBe(false);
  });
});

describe("handleLeadRequest", () => {
  const webhookEnv = { LEAD_WEBHOOK_URL: "https://hooks.example.test/lead", LEAD_WEBHOOK_SECRET: "s3cret" };

  it("delivers a valid lead to the webhook with the secret header", async () => {
    const fetchImpl = vi.fn(ok);
    const res = await handleLeadRequest(request(valid), { env: webhookEnv, fetchImpl, now: 10_000 });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(webhookEnv.LEAD_WEBHOOK_URL);
    expect((init.headers as Record<string, string>)["X-Webhook-Secret"]).toBe("s3cret");
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({ type: "seller_lead", address: valid.address, phone: "(404) 555-0199" });
    expect(body).not.toHaveProperty("website");
  });

  it("sends an email via Resend when configured", async () => {
    const fetchImpl = vi.fn(ok);
    const env = { RESEND_API_KEY: "re_test", LEAD_EMAIL_TO: "a@x.test, b@x.test" };
    const res = await handleLeadRequest(request(valid), { env, fetchImpl, now: 10_000 });
    expect(res.status).toBe(200);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(JSON.parse(String(init.body)).to).toEqual(["a@x.test", "b@x.test"]);
  });

  it("returns 502 when every configured destination fails", async () => {
    const res = await handleLeadRequest(request(valid), { env: webhookEnv, fetchImpl: vi.fn(fail), now: 10_000 });
    expect(res.status).toBe(502);
    expect(console.warn).toHaveBeenCalled(); // lead is logged so it isn't lost
  });

  it("succeeds when at least one destination works", async () => {
    const fetchImpl = vi.fn().mockImplementationOnce(fail).mockImplementationOnce(ok);
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
    const fetchImpl = vi.fn(ok);
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
  it("escapes HTML in user input", () => {
    const lead = toLead(leadSchema.parse({ ...valid, name: "<script>alert(1)</script>" }), "ua");
    const { html, subject } = leadEmail(lead);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(subject).toContain(valid.address);
  });
});
