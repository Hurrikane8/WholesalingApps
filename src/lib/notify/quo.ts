/**
 * Texts through Quo (formerly OpenPhone). Dormant until QUO_API_KEY,
 * QUO_FROM_NUMBER and QUO_NOTIFY_TO are set.
 *
 * Checked against Quo's API reference (September 2026): POST {base}/v1/messages
 * with the raw API key in the Authorization header (no "Bearer"), and the body
 * { content, from, to: [E.164, …] }. Success is 202. The reference now uses
 * https://api.quo.com; set QUO_API_BASE to point elsewhere.
 */
import { TIMEOUT_MS, type Env, type Fetch } from "@/lib/delivery";
import { toE164 } from "@/lib/lead-options";

export const QUO_DEFAULT_BASE = "https://api.quo.com";

export function quoConfigured(env: Env): boolean {
  return Boolean(env.QUO_API_KEY && env.QUO_FROM_NUMBER && env.QUO_NOTIFY_TO);
}

/** QUO_NOTIFY_TO as E.164 numbers (comma-separated in the variable). */
export function quoOwnerNumbers(env: Env): string[] {
  return (env.QUO_NOTIFY_TO ?? "")
    .split(",")
    .map((n) => toE164(n.trim()) ?? n.trim())
    .filter(Boolean);
}

export async function sendQuoText(env: Env, fetchImpl: Fetch, { to, content }: { to: string[]; content: string }): Promise<void> {
  const base = (env.QUO_API_BASE || QUO_DEFAULT_BASE).replace(/\/+$/, "");
  const from = env.QUO_FROM_NUMBER!.startsWith("PN") ? env.QUO_FROM_NUMBER! : (toE164(env.QUO_FROM_NUMBER!) ?? env.QUO_FROM_NUMBER!);
  const res = await fetchImpl(`${base}/v1/messages`, {
    method: "POST",
    headers: { Authorization: env.QUO_API_KEY!, "Content-Type": "application/json" },
    body: JSON.stringify({ content: content.slice(0, 1600), from, to }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`quo responded ${res.status}`);
}
