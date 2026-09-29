import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetRateLimit } from "@/lib/delivery";
import { handleOptOutRequest, optOutSchema, toOptOut } from "@/lib/optouts";
import { optOutAirtableFields } from "@/lib/sinks/airtable";
import { fail, jsonRequest, ok, sentBody, sentUrl } from "./helpers";

const valid = { address: "77 Birch Rd NW, Edmonton", name: "Robin", phone: "780 555 0123", email: "", channel: "Door hanger", notes: "", startedAt: 0 };
const request = (body: unknown) => jsonRequest("/api/opt-out", body);

beforeEach(() => {
  resetRateLimit();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("optOutSchema", () => {
  it("needs only the address", () => {
    const parsed = optOutSchema.parse({ address: "77 Birch Rd" });
    expect(parsed).toMatchObject({ name: "", phone: "", email: "", channel: "" });
  });

  it("rejects a missing address, a bad phone or email, and unknown channels", () => {
    expect(optOutSchema.safeParse({ address: "" }).success).toBe(false);
    expect(optOutSchema.safeParse({ ...valid, phone: "123" }).success).toBe(false);
    expect(optOutSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
    expect(optOutSchema.safeParse({ ...valid, channel: "Carrier pigeon" }).success).toBe(false);
  });

  it("normalizes the phone", () => {
    expect(optOutSchema.parse(valid).phone).toBe("(780) 555-0123");
  });
});

describe("handleOptOutRequest", () => {
  it("delivers to the webhooks and the owner email, subject 'Opt-out: {address}'", async () => {
    const fetchImpl = vi.fn(ok());
    const env = { LEAD_WEBHOOK_URL: "https://sheets.test/exec?secret=s", RESEND_API_KEY: "re", LEAD_EMAIL_TO: "kane@test.invalid" };
    const res = await handleOptOutRequest(request(valid), { env, fetchImpl, now: 10_000 });
    expect(res.status).toBe(200);
    const urls = fetchImpl.mock.calls.map((c) => (c as unknown as [string])[0]);
    expect(urls).toEqual(["https://sheets.test/exec?secret=s", "https://api.resend.com/emails"]);
    expect(sentBody(fetchImpl, 0)).toMatchObject({ type: "opt_out", address: valid.address, channel: "Door hanger" });
    expect(sentBody(fetchImpl, 1).subject).toBe(`Opt-out: ${valid.address}`);
  });

  it("writes to Airtable only when AIRTABLE_OPTOUT_TABLE is set", async () => {
    const airtable = { AIRTABLE_TOKEN: "pat", AIRTABLE_BASE_ID: "appX" };
    const withoutTable = await handleOptOutRequest(request(valid), { env: airtable, fetchImpl: vi.fn(ok()), now: 10_000, mode: "production" });
    expect(withoutTable.status).toBe(502); // Airtable alone doesn't take opt-outs, so nothing stored them
    const fetchImpl = vi.fn(ok('{"records":[{"id":"rec1"}]}'));
    const res = await handleOptOutRequest(request(valid), { env: { ...airtable, AIRTABLE_OPTOUT_TABLE: "Opt-outs" }, fetchImpl, now: 10_000 });
    expect(res.status).toBe(200);
    expect(sentUrl(fetchImpl)).toBe("https://api.airtable.com/v0/appX/Opt-outs");
  });

  it("returns 502 when every sink fails", async () => {
    const res = await handleOptOutRequest(request(valid), { env: { LEAD_WEBHOOK_URL: "https://a.test" }, fetchImpl: vi.fn(fail), now: 10_000 });
    expect(res.status).toBe(502);
  });

  it("drops honeypot and too-fast submissions silently", async () => {
    const fetchImpl = vi.fn(ok());
    const env = { LEAD_WEBHOOK_URL: "https://a.test" };
    expect((await handleOptOutRequest(request({ ...valid, website: "x" }), { env, fetchImpl, now: 10_000 })).status).toBe(200);
    expect((await handleOptOutRequest(request({ ...valid, startedAt: 9_000 }), { env, fetchImpl, now: 10_000 })).status).toBe(200);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns field errors", async () => {
    const res = await handleOptOutRequest(request({ ...valid, address: "" }), { env: {}, now: 10_000 });
    expect(res.status).toBe(400);
    expect((await res.json()).fieldErrors).toHaveProperty("address");
  });
});

describe("optOutAirtableFields", () => {
  it("uses the default field names", () => {
    const fields = optOutAirtableFields(toOptOut(optOutSchema.parse(valid)), new Date("2026-10-05T18:00:00Z"));
    expect(fields).toMatchObject({ Address: valid.address, Name: "Robin", Phone: "(780) 555-0123", Channel: "Door hanger", Date: "2026-10-05" });
  });
});
