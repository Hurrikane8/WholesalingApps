import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { leadSchema, toLead } from "@/lib/leads";
import { deliver, getSinks, type Sink } from "@/lib/sinks";
import { fail, ok, sentBody, sentUrl } from "./helpers";

const lead = toLead(leadSchema.parse({ address: "9 Oak Ave, Edmonton", name: "Al Seller", phone: "7805550199" }), "ua");
const names = (env: Record<string, string>) => getSinks(env, vi.fn()).map((s) => s.name);

beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));
afterEach(() => vi.restoreAllMocks());

describe("getSinks: selection from environment variables", () => {
  it("is empty with nothing configured", () => expect(names({})).toEqual([]));

  it("adds Airtable only with both the token and the base", () => {
    expect(names({ AIRTABLE_TOKEN: "pat" })).toEqual([]);
    expect(names({ AIRTABLE_TOKEN: "pat", AIRTABLE_BASE_ID: "app" })).toEqual(["airtable"]);
  });

  it("adds one webhook per URL", () => {
    expect(names({ LEAD_WEBHOOK_URL: "https://a.test, https://b.test,," })).toEqual(["webhook:1", "webhook:2"]);
  });

  it("adds the owner email only with a key and a recipient", () => {
    expect(names({ RESEND_API_KEY: "re" })).toEqual([]);
    expect(names({ RESEND_API_KEY: "re", LEAD_EMAIL_TO: "kane@test.invalid" })).toEqual(["owner-email"]);
  });

  it("sends opt-outs to Airtable only when there's an opt-outs table", () => {
    const base = { AIRTABLE_TOKEN: "pat", AIRTABLE_BASE_ID: "app" };
    expect(getSinks(base, vi.fn())[0].kinds).not.toContain("opt_out");
    expect(getSinks({ ...base, AIRTABLE_OPTOUT_TABLE: "Opt-outs" }, vi.fn())[0].kinds).toContain("opt_out");
  });
});

describe("deliver", () => {
  it("sends to every sink for the kind, in parallel, and reports each", async () => {
    const fetchImpl = vi.fn().mockImplementationOnce(ok()).mockImplementationOnce(fail);
    const result = await deliver("seller_lead", lead, { env: { LEAD_WEBHOOK_URL: "https://a.test, https://b.test" }, fetchImpl });
    expect(result).toEqual({ configured: 2, delivered: ["webhook:1"], failed: ["webhook:2"] });
  });

  it("skips sinks that don't take the kind", async () => {
    const sink: Sink = { name: "leads-only", kinds: ["seller_lead"], send: vi.fn(async () => {}) };
    const result = await deliver("opt_out", { id: "x" }, { sinks: [sink] });
    expect(result.configured).toBe(0);
    expect(sink.send).not.toHaveBeenCalled();
  });

  it("gives up on a sink that hangs, after the timeout", async () => {
    vi.useFakeTimers();
    const hanging: Sink = { name: "slow", kinds: ["seller_lead"], send: () => new Promise(() => {}) };
    const pending = deliver("seller_lead", lead, { sinks: [hanging] });
    await vi.advanceTimersByTimeAsync(8_001);
    expect(await pending).toEqual({ configured: 1, delivered: [], failed: ["slow"] });
    vi.useRealTimers();
  });

  it("logs failures with the record ID, not its contents", async () => {
    await deliver("seller_lead", lead, { env: { LEAD_WEBHOOK_URL: "https://a.test" }, fetchImpl: vi.fn(fail) });
    const logged = vi.mocked(console.error).mock.calls.map((c) => c.join(" ")).join("\n");
    expect(logged).toContain(lead.id);
    expect(logged).not.toContain("Al Seller");
    expect(logged).not.toContain("9 Oak Ave");
  });
});

describe("webhook sink", () => {
  it("posts { type, source, ...record } and follows redirects", async () => {
    const fetchImpl = vi.fn(ok());
    await deliver("seller_lead", lead, { env: { LEAD_WEBHOOK_URL: "https://script.test/exec?secret=s" }, fetchImpl });
    expect(sentUrl(fetchImpl)).toBe("https://script.test/exec?secret=s");
    expect(sentBody(fetchImpl)).toMatchObject({ type: "seller_lead", id: lead.id, address: "9 Oak Ave, Edmonton" });
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.redirect).toBe("follow");
  });

  it('treats the Sheets script\'s {"ok":false} as a failure', async () => {
    const result = await deliver("seller_lead", lead, { env: { LEAD_WEBHOOK_URL: "https://script.test/exec" }, fetchImpl: vi.fn(ok('{"ok":false,"error":"unauthorized"}')) });
    expect(result.delivered).toEqual([]);
  });
});
