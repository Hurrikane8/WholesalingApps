/**
 * Shared plumbing for the website's form endpoints (/api/leads, /api/buyers):
 * request parsing, rate limiting, spam signals and multi-destination delivery.
 */

export type Env = Record<string, string | undefined>;
export type Fetch = typeof fetch;

const TIMEOUT_MS = 8000;

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/* ─── Spam signals ──────────────────────────────────────────────────────── */

/** Submissions faster than this after the form loaded are almost certainly bots. */
export const MIN_FILL_MS = 2500;

export function isLikelySpam(input: { website?: string; startedAt?: number; name: string }, now = Date.now()): boolean {
  if (input.website) return true; // honeypot: real people never see this field
  if (typeof input.startedAt === "number" && now - input.startedAt < MIN_FILL_MS) return true;
  if (/https?:\/\//i.test(input.name)) return true; // links in a name field are a classic spam tell
  return false;
}

/* ─── Rate limiting ─────────────────────────────────────────────────────── */

/**
 * Best-effort, per-instance rate limit. Serverless instances don't share
 * memory, so this only slows down naive floods; pair it with your host's
 * firewall (e.g. Vercel WAF) if you get targeted.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

export function rateLimit(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, times] of hits) if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return true;
}

export function resetRateLimit(): void {
  hits.clear();
}

/* ─── Request body ──────────────────────────────────────────────────────── */

const MAX_BODY_BYTES = 20_000;

/** Parses a JSON body, or returns an error Response. */
export async function readJson(request: Request): Promise<{ body: unknown } | { error: Response }> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return { error: json({ ok: false, error: "Request too large." }, 413) };
  try {
    return { body: await request.json() };
  } catch {
    return { error: json({ ok: false, error: "Invalid request." }, 400) };
  }
}

export function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}

/* ─── Destinations ──────────────────────────────────────────────────────── */

export async function postWebhook(url: string, payload: unknown, env: Env, fetchImpl: Fetch): Promise<void> {
  const res = await fetchImpl(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(env.LEAD_WEBHOOK_SECRET ? { "X-Webhook-Secret": env.LEAD_WEBHOOK_SECRET } : {}),
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`webhook responded ${res.status}`);
}

export async function sendEmail(
  message: { subject: string; html: string; text: string; replyTo?: string; fromName: string },
  env: Env,
  fetchImpl: Fetch,
): Promise<void> {
  const res = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.LEAD_EMAIL_FROM || `${message.fromName} <onboarding@resend.dev>`,
      to: env.LEAD_EMAIL_TO!.split(",").map((s) => s.trim()).filter(Boolean),
      subject: message.subject,
      html: message.html,
      text: message.text,
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`resend responded ${res.status}: ${await res.text().catch(() => "")}`);
}

/** Renders label/value rows as a simple HTML + text email. */
export function rowsEmail(heading: string, rows: [string, string][], callName?: string, phone?: string) {
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<h2 style="font-family:sans-serif">${escapeHtml(heading)}</h2>
<table cellpadding="6" style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="color:#555;border-bottom:1px solid #eee;vertical-align:top"><strong>${escapeHtml(k)}</strong></td><td style="border-bottom:1px solid #eee">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`,
  )
  .join("\n")}
</table>${phone && callName ? `\n<p style="font-family:sans-serif"><a href="tel:${phone.replace(/\D/g, "")}">Call ${escapeHtml(callName)} now</a></p>` : ""}`;
  return { html, text };
}

export type Job = { name: string; run: () => Promise<void> };
export type DeliveryResult = { configured: number; delivered: string[]; failed: string[] };

/** Runs every configured destination; logs the record if none succeed so it's never lost. */
export async function runDeliveries(jobs: Job[], record: { id: string }, kind: string): Promise<DeliveryResult> {
  const results = await Promise.allSettled(jobs.map((j) => j.run()));
  const delivered: string[] = [];
  const failed: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") delivered.push(jobs[i].name);
    else {
      failed.push(jobs[i].name);
      console.error(`[${kind}] ${jobs[i].name} delivery failed for ${record.id}:`, r.reason);
    }
  });

  if (delivered.length === 0) {
    console.warn(
      jobs.length === 0
        ? `[${kind}] No delivery destination configured (set AIRTABLE_TOKEN + AIRTABLE_BASE_ID, LEAD_WEBHOOK_URL, or RESEND_API_KEY + LEAD_EMAIL_TO). Record:`
        : `[${kind}] All deliveries failed. Record:`,
      JSON.stringify(record),
    );
  }
  return { configured: jobs.length, delivered, failed };
}

/** Standard destination jobs: webhook(s) + email. Airtable jobs are added by each form. */
export function standardJobs(
  env: Env,
  fetchImpl: Fetch,
  payload: unknown,
  email: () => { subject: string; html: string; text: string; replyTo?: string; fromName: string },
): Job[] {
  const jobs: Job[] = [];
  const webhooks = (env.LEAD_WEBHOOK_URL ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  webhooks.forEach((url, i) =>
    jobs.push({ name: `webhook${webhooks.length > 1 ? `#${i + 1}` : ""}`, run: () => postWebhook(url, payload, env, fetchImpl) }),
  );
  if (env.RESEND_API_KEY && env.LEAD_EMAIL_TO) {
    jobs.push({ name: "email", run: () => sendEmail(email(), env, fetchImpl) });
  }
  return jobs;
}
