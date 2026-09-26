/**
 * Investor / buyers list signups (/api/buyers): validation, spam filtering and
 * delivery to the Airtable Buyers table, webhook(s) and/or email.
 */
import { z } from "zod";
import { site } from "@/config/site";
import { airtable } from "@/config/airtable";
import { BUYER_CONSENT_TEXT } from "@/content/consent";
import { airtableConfigured, createAirtableRecord, todayInMarket } from "@/lib/airtable";
import {
  clientIp,
  fieldErrors,
  isLikelySpam,
  json,
  rateLimit,
  readJson,
  rowsEmail,
  runDeliveries,
  standardJobs,
  type Env,
  type Fetch,
} from "@/lib/delivery";
import { phoneSchema } from "@/lib/leads";
import { FINANCING, PROPERTY_TYPES, STRATEGIES, TARGET_AREAS, values } from "@/lib/lead-options";

const optionalText = (max: number) => z.string().trim().max(max).optional().default("");
const choices = (options: Parameters<typeof values>[0], max = 20) =>
  z.array(z.enum(values(options))).max(max).optional().default([]);
const money = z.number().min(0).max(100_000_000).optional();

export const buyerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.email("Please enter a valid email").max(200),
  phone: phoneSchema,
  company: optionalText(150),
  strategies: choices(STRATEGIES),
  propertyTypes: choices(PROPERTY_TYPES),
  targetAreas: choices(TARGET_AREAS),
  financing: choices(FINANCING),
  maxPrice: money,
  maxReno: money,
  maxCondoFee: z.number().min(0).max(100_000).optional(),
  proofOfFunds: z.boolean().optional().default(false),
  dealsLast12Months: z.number().int().min(0).max(1000).optional(),
  notes: optionalText(2000),
  consent: z.boolean().refine((v) => v, "Please confirm you'd like to receive deals by email and text"),
  // Attribution.
  page: optionalText(300),
  referrer: optionalText(500),
  utm: z.record(z.string(), z.string().max(200)).optional().default({}),
  // Spam signals.
  startedAt: z.number().optional(),
  website: optionalText(200),
});

export type BuyerInput = z.output<typeof buyerSchema>;
export type Buyer = Omit<BuyerInput, "website" | "startedAt"> & { id: string; receivedAt: string; userAgent: string };

export function toBuyer(input: BuyerInput, userAgent: string): Buyer {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { website, startedAt, ...rest } = input;
  return { ...rest, id: crypto.randomUUID(), receivedAt: new Date().toISOString(), userAgent: userAgent.slice(0, 300) };
}

const cad = (n?: number) => (typeof n === "number" ? n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }) : "");
const labels = (options: readonly { value: string; label: string }[], selected: string[]) =>
  selected.map((v) => options.find((o) => o.value === v)?.label ?? v).join(", ");

function hasCriteria(b: Buyer): boolean {
  return Boolean(b.strategies.length || b.propertyTypes.length || b.targetAreas.length || b.maxPrice);
}

function consentRecord(b: Buyer): string {
  const when = new Date(b.receivedAt).toLocaleString("en-CA", { timeZone: airtable.timeZone });
  return `CASL express consent given ${when} via ${site.url}${b.page || "/investors"}: "${BUYER_CONSENT_TEXT}"`;
}

export function buyerEmail(b: Buyer) {
  const rows: [string, string][] = [
    ["Name", b.name],
    ["Company", b.company],
    ["Phone", b.phone],
    ["Email", b.email],
    ["Strategy", labels(STRATEGIES, b.strategies)],
    ["Property types", labels(PROPERTY_TYPES, b.propertyTypes)],
    ["Target areas", labels(TARGET_AREAS, b.targetAreas)],
    ["Financing", labels(FINANCING, b.financing)],
    ["Max purchase price", cad(b.maxPrice)],
    ["Max reno budget", cad(b.maxReno)],
    ["Max condo fee", cad(b.maxCondoFee)],
    ["Proof of funds available", b.proofOfFunds ? "Yes (claimed)" : "Not stated"],
    ["Deals bought last 12 months", b.dealsLast12Months === undefined ? "" : String(b.dealsLast12Months)],
    ["Notes", b.notes],
    ["Consent", consentRecord(b)],
    ["Signup ID", b.id],
  ];
  const { html, text } = rowsEmail(`New buyers list signup on ${site.name}`, rows.filter(([, v]) => v), b.name, b.phone);
  return { subject: `New buyer signup: ${b.name}`, html, text, replyTo: b.email, fromName: site.name };
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
    Object.keys(b.utm).length > 0 && `Campaign: ${Object.entries(b.utm).map(([k, v]) => `${k}=${v}`).join(", ")}`,
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

export async function deliverBuyer(b: Buyer, env: Env = process.env, fetchImpl: Fetch = fetch) {
  const jobs = standardJobs(env, fetchImpl, { type: "buyer_signup", source: site.url, ...b }, () => buyerEmail(b));
  if (airtableConfigured(env)) {
    jobs.unshift({
      name: "airtable",
      run: async () => {
        await createAirtableRecord({
          table: airtable.buyer.table,
          fields: buyerAirtableFields(b),
          required: [airtable.buyer.fields.name],
          notesField: airtable.buyer.fields.notes,
          env,
          fetchImpl,
        });
      },
    });
  }
  return runDeliveries(jobs, b, "buyers");
}

export async function handleBuyerRequest(
  request: Request,
  deps: { env?: Env; fetchImpl?: Fetch; now?: number } = {},
): Promise<Response> {
  if (!rateLimit(`buyer:${clientIp(request)}`, deps.now)) {
    return json({ ok: false, error: `Too many requests. Please call or text us at ${site.phone}.` }, 429);
  }

  const read = await readJson(request);
  if ("error" in read) return read.error;

  const parsed = buyerSchema.safeParse(read.body);
  if (!parsed.success) {
    return json({ ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error.issues) }, 400);
  }
  if (isLikelySpam(parsed.data, deps.now)) return json({ ok: true });

  const buyer = toBuyer(parsed.data, request.headers.get("user-agent") ?? "");
  const result = await deliverBuyer(buyer, deps.env, deps.fetchImpl);
  if (result.configured > 0 && result.delivered.length === 0) {
    return json({ ok: false, error: `Sorry, something went wrong on our end. Please call or text us at ${site.phone}.` }, 502);
  }
  return json({ ok: true, id: buyer.id });
}
