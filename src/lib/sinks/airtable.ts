/**
 * The Airtable sink: Seller Leads, Buyers and (when AIRTABLE_OPTOUT_TABLE is
 * set) an opt-outs table in the "Wholesaling CRM" base. Field names live in
 * src/config/airtable.ts. Records are sent with typecast, and a rejected
 * field is moved into Notes and retried (src/lib/airtable.ts), so a record is
 * never lost to a renamed field or a missing select option.
 */
import { airtable } from "@/config/airtable";
import { airtableConfigured, createAirtableRecord, todayInMarket } from "@/lib/airtable";
import type { Buyer } from "@/lib/buyers";
import { consentRecord, hasCriteria } from "@/lib/buyers";
import type { Env, Fetch } from "@/lib/delivery";
import type { Lead } from "@/lib/leads";
import type { OptOut } from "@/lib/optouts";
import { campaignParams, describeTouch, formatParams } from "@/lib/touch";
import type { Sink, SinkKind } from "./types";

const inEdmonton = (iso: string) => new Date(iso).toLocaleString("en-CA", { timeZone: airtable.timeZone });

/** The Seller Leads record for a web lead. */
export function sellerAirtableFields(lead: Lead, now = new Date()): Record<string, unknown> {
  const f = airtable.seller.fields;
  const motivation = [lead.reason, lead.notes].filter(Boolean).join(": ");
  const campaign = campaignParams(lead);
  const notes = [
    `Website lead, ${inEdmonton(lead.receivedAt)}`,
    `OK to text: ${lead.smsConsent ? "Yes (ticked the consent box)" : "No"}`,
    lead.page && `Page: ${lead.page}`,
    lead.referrer && `Referrer: ${lead.referrer}`,
    Object.keys(campaign).length > 0 && `Campaign: ${formatParams(campaign)}`,
    describeTouch("First touch", lead.firstTouch),
    describeTouch("Last touch", lead.lastTouch),
    `Lead ID: ${lead.id}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    [f.address]: lead.address,
    [f.name]: lead.name,
    [f.phone]: lead.phone,
    [f.email]: lead.email,
    [f.status]: airtable.seller.defaults.status,
    [f.source]: airtable.seller.defaults.source,
    [f.propertyType]: lead.propertyType,
    [f.timeline]: lead.timeline,
    [f.condition]: lead.condition,
    [f.occupancy]: lead.occupancy,
    [f.motivation]: motivation,
    [f.nextFollowUp]: todayInMarket(now),
    [f.notes]: notes,
  };
}

/** The Buyers record for a website signup. */
export function buyerAirtableFields(b: Buyer, now = new Date()): Record<string, unknown> {
  const f = airtable.buyer.fields;
  const d = airtable.buyer.defaults;
  const notes = [
    `Website buyers list signup`,
    b.company && `Company: ${b.company}`,
    b.notes && `In their words: ${b.notes}`,
    consentRecord(b),
    Object.keys(b.utm).length > 0 && `Campaign: ${formatParams(b.utm)}`,
    `Signup ID: ${b.id}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    [f.name]: b.company ? `${b.name} (${b.company})` : b.name,
    [f.phone]: b.phone,
    [f.email]: b.email,
    [f.tier]: hasCriteria(b) ? d.tierWithCriteria : d.tierWithoutCriteria,
    [f.source]: d.source,
    [f.financing]: b.financing,
    [f.strategy]: b.strategies,
    [f.propertyTypes]: b.propertyTypes,
    [f.targetAreas]: b.targetAreas,
    [f.maxPrice]: b.maxPrice,
    [f.maxReno]: b.maxReno,
    [f.maxCondoFee]: b.maxCondoFee,
    [f.proofOfFunds]: b.proofOfFunds ? d.proofOfFundsClaimed : d.proofOfFundsUnknown,
    [f.dealsLast12Months]: b.dealsLast12Months,
    [f.caslConsent]: d.caslConsent,
    [f.nextFollowUp]: todayInMarket(now),
    [f.notes]: notes,
  };
}

/** The opt-outs record (field names TO CONFIRM in src/config/airtable.ts). */
export function optOutAirtableFields(o: OptOut, now = new Date()): Record<string, unknown> {
  const f = airtable.optOut.fields;
  const notes = [
    o.notes,
    `Opted out on the website, ${inEdmonton(o.receivedAt)}`,
    describeTouch("First touch", o.firstTouch),
    describeTouch("Last touch", o.lastTouch),
    `Opt-out ID: ${o.id}`,
  ]
    .filter(Boolean)
    .join("\n");
  return {
    [f.address]: o.address,
    [f.name]: o.name,
    [f.phone]: o.phone,
    [f.email]: o.email,
    [f.channel]: o.channel,
    [f.date]: todayInMarket(now),
    [f.notes]: notes,
  };
}

export function airtableSink(env: Env, fetchImpl: Fetch): Sink | null {
  if (!airtableConfigured(env)) return null;
  const optOutTable = env.AIRTABLE_OPTOUT_TABLE?.trim();
  const kinds: SinkKind[] = ["seller_lead", "buyer_signup", ...(optOutTable ? (["opt_out"] as const) : [])];
  return {
    name: "airtable",
    kinds,
    async send(kind, record) {
      if (kind === "seller_lead") {
        await createAirtableRecord({
          table: airtable.seller.table,
          fields: sellerAirtableFields(record as Lead),
          required: [airtable.seller.fields.address],
          notesField: airtable.seller.fields.notes,
          env,
          fetchImpl,
        });
      } else if (kind === "buyer_signup") {
        await createAirtableRecord({
          table: airtable.buyer.table,
          fields: buyerAirtableFields(record as Buyer),
          required: [airtable.buyer.fields.name],
          notesField: airtable.buyer.fields.notes,
          env,
          fetchImpl,
        });
      } else if (optOutTable) {
        await createAirtableRecord({
          table: optOutTable,
          fields: optOutAirtableFields(record as OptOut),
          required: [airtable.optOut.fields.address],
          notesField: airtable.optOut.fields.notes,
          env,
          fetchImpl,
        });
      }
    },
  };
}
