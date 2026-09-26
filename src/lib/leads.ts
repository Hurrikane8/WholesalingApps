/**
 * Seller lead intake: validation, spam filtering and delivery.
 *
 * Leads are delivered to every destination configured in the environment:
 *   LEAD_WEBHOOK_URL   – one or more comma-separated URLs that receive the lead
 *                        as JSON (Zapier, Make, GoHighLevel, REsimpli, Podio…)
 *   LEAD_WEBHOOK_SECRET – optional; sent as the X-Webhook-Secret header
 *   RESEND_API_KEY + LEAD_EMAIL_TO – email notification via resend.com
 *   LEAD_EMAIL_FROM    – optional sender, e.g. "Leads <leads@yourdomain.com>"
 *
 * If nothing is configured, or every destination fails, the full lead is
 * written to the server log so it's never lost.
 */
import { z } from "zod";
import { site } from "@/config/site";
import { CONDITIONS, REASONS, TIMELINES, normalizePhone } from "@/lib/lead-options";

const optionalText = (max: number) => z.string().trim().max(max).optional().default("");
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.union([z.enum(values), z.literal("")]).optional().default("");

export const leadSchema = z.object({
  address: z.string().trim().min(5, "Please enter the property address").max(200),
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z
    .string()
    .trim()
    .transform((v, ctx) => {
      const phone = normalizePhone(v);
      if (!phone) {
        ctx.addIssue({ code: "custom", message: "Please enter a valid 10-digit phone number" });
        return z.NEVER;
      }
      return phone;
    }),
  email: z.union([z.email("Please enter a valid email").max(200), z.literal("")]).optional().default(""),
  condition: optionalEnum(CONDITIONS),
  timeline: optionalEnum(TIMELINES),
  reason: optionalEnum(REASONS),
  notes: optionalText(2000),
  smsConsent: z.boolean().optional().default(false),
  // Attribution, filled in by the form.
  page: optionalText(300),
  referrer: optionalText(500),
  utm: z.record(z.string(), z.string().max(200)).optional().default({}),
  // Spam signals.
  startedAt: z.number().optional(),
  website: optionalText(200), // honeypot: real people never see this field
});

export type LeadInput = z.output<typeof leadSchema>;

export type Lead = Omit<LeadInput, "website" | "startedAt"> & {
  id: string;
  receivedAt: string;
  userAgent: string;
};

/** Submissions faster than this after the form loaded are almost certainly bots. */
export const MIN_FILL_MS = 2500;

export function isLikelySpam(input: LeadInput, now = Date.now()): boolean {
  if (input.website) return true;
  if (typeof input.startedAt === "number" && now - input.startedAt < MIN_FILL_MS) return true;
  // Links in the name field are a classic spam tell.
  if (/https?:\/\//i.test(input.name)) return true;
  return false;
}

export function toLead(input: LeadInput, userAgent: string): Lead {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { website, startedAt, ...rest } = input;
  return { ...rest, id: crypto.randomUUID(), receivedAt: new Date().toISOString(), userAgent: userAgent.slice(0, 300) };
}

/* ─── Delivery ──────────────────────────────────────────────────────────── */

type Env = Record<string, string | undefined>;
type Fetch = typeof fetch;

export type DeliveryResult = { configured: number; delivered: string[]; failed: string[] };

const TIMEOUT_MS = 8000;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function leadRows(lead: Lead): [string, string][] {
  const rows: [string, string][] = [
    ["Property address", lead.address],
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Email", lead.email],
    ["Condition", lead.condition],
    ["Timeline", lead.timeline],
    ["Reason for selling", lead.reason],
    ["Notes", lead.notes],
    ["OK to text", lead.smsConsent ? "Yes" : "No"],
    ["Submitted from", lead.page],
    ["Referrer", lead.referrer],
    ...Object.entries(lead.utm).map(([k, v]) => [k, v] as [string, string]),
    ["Received", lead.receivedAt],
    ["Lead ID", lead.id],
  ];
  return rows.filter(([, v]) => v);
}

export function leadEmail(lead: Lead): { subject: string; html: string; text: string } {
  const rows = leadRows(lead);
  const subject = `New seller lead: ${lead.address}`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<h2 style="font-family:sans-serif">New seller lead from ${escapeHtml(site.name)}</h2>
<table cellpadding="6" style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="color:#555;border-bottom:1px solid #eee;vertical-align:top"><strong>${escapeHtml(k)}</strong></td><td style="border-bottom:1px solid #eee">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`,
  )
  .join("\n")}
</table>
<p style="font-family:sans-serif"><a href="tel:${lead.phone.replace(/\D/g, "")}">Call ${escapeHtml(lead.name)} now</a></p>`;
  return { subject, html, text };
}

async function postWebhook(url: string, lead: Lead, env: Env, fetchImpl: Fetch): Promise<void> {
  const res = await fetchImpl(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(env.LEAD_WEBHOOK_SECRET ? { "X-Webhook-Secret": env.LEAD_WEBHOOK_SECRET } : {}),
    },
    body: JSON.stringify({ type: "seller_lead", source: site.url, ...lead }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`webhook responded ${res.status}`);
}

async function sendResendEmail(lead: Lead, env: Env, fetchImpl: Fetch): Promise<void> {
  const { subject, html, text } = leadEmail(lead);
  const res = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.LEAD_EMAIL_FROM || `${site.name} <onboarding@resend.dev>`,
      to: env.LEAD_EMAIL_TO!.split(",").map((s) => s.trim()).filter(Boolean),
      subject,
      html,
      text,
      ...(lead.email ? { reply_to: lead.email } : {}),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`resend responded ${res.status}: ${await res.text().catch(() => "")}`);
}

export async function deliverLead(lead: Lead, env: Env = process.env, fetchImpl: Fetch = fetch): Promise<DeliveryResult> {
  const jobs: { name: string; run: () => Promise<void> }[] = [];

  const webhooks = (env.LEAD_WEBHOOK_URL ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  webhooks.forEach((url, i) => jobs.push({ name: `webhook${webhooks.length > 1 ? `#${i + 1}` : ""}`, run: () => postWebhook(url, lead, env, fetchImpl) }));

  if (env.RESEND_API_KEY && env.LEAD_EMAIL_TO) {
    jobs.push({ name: "email", run: () => sendResendEmail(lead, env, fetchImpl) });
  }

  const results = await Promise.allSettled(jobs.map((j) => j.run()));
  const delivered: string[] = [];
  const failed: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") delivered.push(jobs[i].name);
    else {
      failed.push(jobs[i].name);
      console.error(`[leads] ${jobs[i].name} delivery failed for ${lead.id}:`, r.reason);
    }
  });

  if (delivered.length === 0) {
    // Last-resort record so the lead can be recovered from the hosting logs.
    console.warn(
      jobs.length === 0
        ? "[leads] No delivery destination configured (set LEAD_WEBHOOK_URL or RESEND_API_KEY + LEAD_EMAIL_TO). Lead:"
        : "[leads] All deliveries failed. Lead:",
      JSON.stringify(lead),
    );
  }

  return { configured: jobs.length, delivered, failed };
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

/* ─── Request handler ───────────────────────────────────────────────────── */

const MAX_BODY_BYTES = 20_000;

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function handleLeadRequest(
  request: Request,
  deps: { env?: Env; fetchImpl?: Fetch; now?: number } = {},
): Promise<Response> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  if (!rateLimit(ip, deps.now)) {
    return json({ ok: false, error: `Too many requests. Please call us at ${site.phone}.` }, 429);
  }

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return json({ ok: false, error: "Request too large." }, 413);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return json({ ok: false, error: "Please check the highlighted fields.", fieldErrors }, 400);
  }

  // Pretend spam succeeded so bots don't learn what tripped the filter.
  if (isLikelySpam(parsed.data, deps.now)) return json({ ok: true });

  const lead = toLead(parsed.data, request.headers.get("user-agent") ?? "");
  const result = await deliverLead(lead, deps.env, deps.fetchImpl);

  if (result.configured > 0 && result.delivered.length === 0) {
    return json(
      { ok: false, error: `Sorry, something went wrong on our end. Please call or text us at ${site.phone}.` },
      502,
    );
  }
  return json({ ok: true, id: lead.id });
}
