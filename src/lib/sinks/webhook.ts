/**
 * Webhook sinks: one per URL in LEAD_WEBHOOK_URL (comma-separated), for the
 * Google Sheets backup (docs/integrations/google-sheets-backup.gs), Zapier,
 * Make or anything else that accepts JSON. Every kind of record goes to every
 * webhook, as { type, source, ...record }. Redirects are followed (Apps Script
 * answers a POST with one) and a final 2xx counts as delivered.
 */
import { site } from "@/config/site";
import { TIMEOUT_MS, type Env, type Fetch } from "@/lib/delivery";
import type { Sink, SinkKind } from "./types";

export function webhookUrls(env: Env): string[] {
  return (env.LEAD_WEBHOOK_URL ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function postWebhook(url: string, payload: unknown, env: Env, fetchImpl: Fetch): Promise<void> {
  const res = await fetchImpl(url, {
    method: "POST",
    redirect: "follow",
    headers: {
      "Content-Type": "application/json",
      ...(env.LEAD_WEBHOOK_SECRET ? { "X-Webhook-Secret": env.LEAD_WEBHOOK_SECRET } : {}),
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`webhook responded ${res.status}`);
  // Apps Script can't send error status codes, so the Sheets backup answers {"ok":false} instead.
  const body = await res.text().catch(() => "");
  try {
    if ((JSON.parse(body) as { ok?: unknown })?.ok === false) throw new Error(`webhook refused the record: ${body.slice(0, 200)}`);
  } catch (error) {
    if (error instanceof SyntaxError) return; // not JSON: a plain 2xx is success
    throw error;
  }
}

export function webhookSinks(env: Env, fetchImpl: Fetch): Sink[] {
  const kinds: SinkKind[] = ["seller_lead", "buyer_signup", "opt_out"];
  return webhookUrls(env).map((url, i) => ({
    name: `webhook:${i + 1}`,
    kinds,
    send: (kind, record) => postWebhook(url, { type: kind, source: site.url, ...(record as object) }, env, fetchImpl),
  }));
}
