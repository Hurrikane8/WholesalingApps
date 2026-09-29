/**
 * The owner alert email (Resend): part of the durable set, because it's a
 * written record in Kane's inbox. Sent from LEAD_EMAIL_FROM to LEAD_EMAIL_TO.
 */
import type { Buyer } from "@/lib/buyers";
import type { Env, Fetch } from "@/lib/delivery";
import type { Lead } from "@/lib/leads";
import type { OptOut } from "@/lib/optouts";
import { emailConfigured, ownerAddresses, sendEmail } from "@/lib/notify/resend";
import { buyerAlertEmail, optOutAlertEmail, ownerAlertEmail } from "@/lib/notify/templates";
import type { Sink } from "./types";

export function ownerEmailSink(env: Env, fetchImpl: Fetch): Sink | null {
  if (!emailConfigured(env)) return null;
  return {
    name: "owner-email",
    kinds: ["seller_lead", "buyer_signup", "opt_out"],
    async send(kind, record) {
      const to = ownerAddresses(env);
      if (kind === "seller_lead") {
        const lead = record as Lead;
        await sendEmail({ ...ownerAlertEmail(lead), to, replyTo: lead.email || undefined }, env, fetchImpl);
      } else if (kind === "buyer_signup") {
        const buyer = record as Buyer;
        await sendEmail({ ...buyerAlertEmail(buyer), to, replyTo: buyer.email }, env, fetchImpl);
      } else {
        const optOut = record as OptOut;
        await sendEmail({ ...optOutAlertEmail(optOut), to, replyTo: optOut.email || undefined }, env, fetchImpl);
      }
    },
  };
}
