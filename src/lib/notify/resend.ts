/** Email through Resend (https://resend.com). Needs RESEND_API_KEY. */
import { site } from "@/config/site";
import { TIMEOUT_MS, type Env, type Fetch } from "@/lib/delivery";

export type Email = { subject: string; html: string; text: string };

/** LEAD_EMAIL_TO as a list. */
export function ownerAddresses(env: Env): string[] {
  return (env.LEAD_EMAIL_TO ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function emailConfigured(env: Env): boolean {
  return Boolean(env.RESEND_API_KEY && ownerAddresses(env).length);
}

export async function sendEmail(
  message: Email & { to: string[]; replyTo?: string },
  env: Env,
  fetchImpl: Fetch,
): Promise<void> {
  const res = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.LEAD_EMAIL_FROM || `${site.name} <onboarding@resend.dev>`,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`resend responded ${res.status}: ${await res.text().catch(() => "")}`);
}
