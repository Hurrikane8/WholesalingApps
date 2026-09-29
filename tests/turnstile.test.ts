import { describe, expect, it, vi } from "vitest";
import { passesTurnstile, turnstileToken, TURNSTILE_VERIFY_URL } from "@/lib/turnstile";

const request = () => new Request("https://example.test/api/leads", { method: "POST", headers: { "x-forwarded-for": "203.0.113.9" } });
const reply = (body: unknown) => vi.fn(async () => Response.json(body));

describe("Turnstile (spec 8.3)", () => {
  it("passes everything when it's off (no secret)", async () => {
    const fetchImpl = reply({ success: false });
    expect(await passesTurnstile({}, request(), {}, fetchImpl)).toBe(true);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("fails a request without a token when it's on", async () => {
    expect(await passesTurnstile({}, request(), { TURNSTILE_SECRET_KEY: "s" }, reply({ success: true }))).toBe(false);
  });

  it("asks Cloudflare, with the secret, the token and the visitor's IP", async () => {
    const fetchImpl = reply({ success: true });
    expect(await passesTurnstile({ turnstileToken: "t" }, request(), { TURNSTILE_SECRET_KEY: "s" }, fetchImpl)).toBe(true);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(TURNSTILE_VERIFY_URL);
    const form = init.body as URLSearchParams;
    expect(form.get("secret")).toBe("s");
    expect(form.get("response")).toBe("t");
    expect(form.get("remoteip")).toBe("203.0.113.9");
  });

  it("fails a token Cloudflare rejects", async () => {
    expect(await passesTurnstile({ turnstileToken: "t" }, request(), { TURNSTILE_SECRET_KEY: "s" }, reply({ success: false }))).toBe(false);
  });

  it("lets the request through if Cloudflare can't be reached", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const down = vi.fn(async () => {
      throw new Error("network");
    });
    expect(await passesTurnstile({ turnstileToken: "t" }, request(), { TURNSTILE_SECRET_KEY: "s" }, down)).toBe(true);
  });

  it("reads the token only when it's a string", () => {
    expect(turnstileToken({ turnstileToken: 42 })).toBe("");
    expect(turnstileToken(null)).toBe("");
    expect(turnstileToken({ turnstileToken: "abc" })).toBe("abc");
  });
});
