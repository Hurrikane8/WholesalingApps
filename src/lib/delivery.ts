/**
 * Shared plumbing for the form endpoints (/api/leads, /api/buyers,
 * /api/opt-out): request parsing, rate limiting and spam signals.
 * Where records go lives in src/lib/sinks; alerts and confirmations in src/lib/notify.
 */

export type Env = Record<string, string | undefined>;
export type Fetch = typeof fetch;

/** Every outbound call gives up after this long. */
export const TIMEOUT_MS = 8000;

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
export const MIN_FILL_MS = 3000;

export function isLikelySpam(input: { website?: string; startedAt?: number; name?: string }, now = Date.now()): boolean {
  if (input.website) return true; // honeypot: real people never see this field
  if (typeof input.startedAt === "number" && now - input.startedAt < MIN_FILL_MS) return true;
  if (input.name && /https?:\/\//i.test(input.name)) return true; // links in a name field are a classic spam tell
  return false;
}

/* ─── Rate limiting ─────────────────────────────────────────────────────── */

/**
 * Best-effort, per-instance rate limit. Serverless instances don't share
 * memory, so this only slows down naive floods; pair it with your host's
 * firewall if you get targeted.
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

/* ─── Duplicate submissions ─────────────────────────────────────────────── */

/** A double-tap or a retry with the same submissionId within 15 minutes isn't delivered twice (per instance). */
const DUPLICATE_WINDOW_MS = 15 * 60 * 1000;
const seenSubmissions = new Map<string, number>();

/** True if this submissionId was already accepted recently; records it otherwise. */
export function isDuplicateSubmission(submissionId: string | undefined, now = Date.now()): boolean {
  if (!submissionId) return false;
  for (const [id, at] of seenSubmissions) if (now - at >= DUPLICATE_WINDOW_MS) seenSubmissions.delete(id);
  if (seenSubmissions.has(submissionId)) return true;
  seenSubmissions.set(submissionId, now);
  return false;
}

/** Lets a submission be retried after its delivery failed. */
export function forgetSubmission(submissionId: string | undefined): void {
  if (submissionId) seenSubmissions.delete(submissionId);
}

/** Tests only: clears the rate limit and duplicate memory. */
export function resetRateLimit(): void {
  hits.clear();
  seenSubmissions.clear();
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

/** Runs `task`, rejecting if it takes longer than `ms`. */
export async function withTimeout<T>(task: Promise<T>, ms = TIMEOUT_MS, label = "task"): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([task, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
