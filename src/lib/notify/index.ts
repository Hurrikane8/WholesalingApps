/**
 * Everything that happens after a seller lead is safely stored (spec 4.4,
 * 4.5), run after the response so the form never waits on it:
 *
 *   - Kane's text through Quo (when QUO_* is set);
 *   - Kane's push through ntfy (when NTFY_TOPIC_URL is set; no personal information);
 *   - the seller's confirmation email (they gave an email; SELLER_ACK_EMAIL isn't "false");
 *   - the seller's confirmation text (Quo is set, SELLER_ACK_SMS is "true", they
 *     ticked the consent box, and it's 08:00–21:00 in Edmonton).
 *
 * Each runs on its own; a failure logs the lead ID only.
 */
import { airtable } from "@/config/airtable";
import type { Env, Fetch } from "@/lib/delivery";
import type { Lead } from "@/lib/leads";
import { toE164 } from "@/lib/lead-options";
import { ntfyConfigured, sendPush } from "./ntfy";
import { quoConfigured, quoOwnerNumbers, sendQuoText } from "./quo";
import { emailConfigured, ownerAddresses, sendEmail } from "./resend";
import { ownerPush, ownerText, sellerEmail, sellerText } from "./templates";

/** Seller texts only go out between 08:00 and 21:00 Edmonton time. */
export function withinTextingHours(now = new Date()): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-CA", { timeZone: airtable.timeZone, hour: "numeric", hourCycle: "h23" }).format(now),
  );
  return hour >= 8 && hour < 21;
}

export type AfterTask = { name: string; run: () => Promise<void> };

/** The follow-ups a lead qualifies for, given the configuration, consent and time. */
export function afterLeadTasks(lead: Lead, env: Env, fetchImpl: Fetch, now = new Date()): AfterTask[] {
  const tasks: AfterTask[] = [];

  if (quoConfigured(env)) {
    tasks.push({ name: "owner-text", run: () => sendQuoText(env, fetchImpl, { to: quoOwnerNumbers(env), content: ownerText(lead) }) });
  }
  if (ntfyConfigured(env)) {
    tasks.push({ name: "owner-push", run: () => sendPush(env, fetchImpl, ownerPush(lead)) });
  }
  if (lead.email && env.SELLER_ACK_EMAIL !== "false" && emailConfigured(env)) {
    tasks.push({
      name: "seller-email",
      run: () => sendEmail({ ...sellerEmail(lead), to: [lead.email], replyTo: ownerAddresses(env)[0] }, env, fetchImpl),
    });
  }
  const sellerNumber = toE164(lead.phone);
  if (quoConfigured(env) && env.SELLER_ACK_SMS === "true" && lead.smsConsent && sellerNumber && withinTextingHours(now)) {
    tasks.push({ name: "seller-text", run: () => sendQuoText(env, fetchImpl, { to: [sellerNumber], content: sellerText(lead) }) });
  }
  return tasks;
}

export async function afterLead(lead: Lead, { env = process.env, fetchImpl = fetch, now = new Date() }: { env?: Env; fetchImpl?: Fetch; now?: Date } = {}) {
  const tasks = afterLeadTasks(lead, env, fetchImpl, now);
  const results = await Promise.allSettled(tasks.map((t) => t.run()));
  results.forEach((result, i) => {
    // The lead ID only: never names, numbers or addresses in the logs.
    if (result.status === "rejected") console.error(`[lead:${tasks[i].name}] failed for ${lead.id}`);
  });
  return results.map((r, i) => ({ name: tasks[i].name, ok: r.status === "fulfilled" }));
}
