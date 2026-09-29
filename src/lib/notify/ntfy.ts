/**
 * Instant push to Kane's phone through ntfy (https://ntfy.sh), free and
 * optional. Dormant until NTFY_TOPIC_URL is set; use a long, random topic
 * name. The push never carries personal information.
 */
import { TIMEOUT_MS, type Env, type Fetch } from "@/lib/delivery";

export function ntfyConfigured(env: Env): boolean {
  return Boolean(env.NTFY_TOPIC_URL?.trim());
}

export async function sendPush(
  env: Env,
  fetchImpl: Fetch,
  push: { title: string; body: string; priority: "high" | "default"; tags: string },
): Promise<void> {
  const res = await fetchImpl(env.NTFY_TOPIC_URL!.trim(), {
    method: "POST",
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      Title: push.title,
      Priority: push.priority,
      Tags: push.tags,
      ...(env.NTFY_TOKEN ? { Authorization: `Bearer ${env.NTFY_TOKEN}` } : {}),
    },
    body: push.body,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`ntfy responded ${res.status}`);
}
