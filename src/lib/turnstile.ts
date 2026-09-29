/**
 * Cloudflare Turnstile (spec 8.3): an optional, invisible bot check, off by
 * default. Turn it on only if spam gets past the honeypot and timing check:
 * set NEXT_PUBLIC_TURNSTILE_SITE_KEY (the widget) and TURNSTILE_SECRET_KEY
 * (the server check). With no secret, every request passes.
 */
import { clientIp, withTimeout, type Env, type Fetch } from "@/lib/delivery";

export const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** The token the form sends, read from the raw body (the form schemas don't carry it). */
export function turnstileToken(body: unknown): string {
  if (typeof body !== "object" || body === null) return "";
  const token = (body as { turnstileToken?: unknown }).turnstileToken;
  return typeof token === "string" ? token.slice(0, 2048) : "";
}

/**
 * True when Turnstile is off, or Cloudflare accepts the token. A missing or
 * rejected token fails. If Cloudflare can't be reached, the request passes:
 * losing a real seller costs more than letting one bot through, and the
 * honeypot and timing check still apply.
 */
export async function passesTurnstile(body: unknown, request: Request, env: Env, fetchImpl: Fetch): Promise<boolean> {
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  const token = turnstileToken(body);
  if (!token) return false;
  const form = new URLSearchParams({ secret, response: token });
  const ip = clientIp(request);
  if (ip !== "unknown") form.set("remoteip", ip);
  try {
    const res = await withTimeout(fetchImpl(TURNSTILE_VERIFY_URL, { method: "POST", body: form }), 5000, "turnstile");
    const data = (await res.json()) as { success?: unknown };
    return data.success === true;
  } catch {
    console.error("[turnstile] verification unavailable; allowing the request");
    return true;
  }
}

/** What the form shows when the check fails. */
export function turnstileFailedMessage(phone: string): string {
  return `The form couldn't be checked. Please try again, or call or text me at ${phone}.`;
}
