/**
 * Seller lead intake (/api/leads): validation, spam filtering and delivery.
 *
 * Leads go to every destination configured in the environment:
 *   AIRTABLE_TOKEN + AIRTABLE_BASE_ID – a new record in Seller Leads (src/config/airtable.ts)
 *   LEAD_WEBHOOK_URL (+ LEAD_WEBHOOK_SECRET) – JSON to Zapier, Make, Quo, etc.
 *   RESEND_API_KEY + LEAD_EMAIL_TO (+ LEAD_EMAIL_FROM) – an email notification
 * If nothing is configured, or every destination fails, the lead is written
 * to the server log so it's never lost.
 */
import { z } from "zod";
import { site } from "@/config/site";
import { airtable } from "@/config/airtable";
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
import { CONDITIONS, OCCUPANCY, PROPERTY_TYPES, REASONS, TIMELINES, normalizePhone, values } from "@/lib/lead-options";

export { isLikelySpam, resetRateLimit } from "@/lib/delivery";

const optionalText = (max: number) => z.string().trim().max(max).optional().default("");
const optionalChoice = (choices: [string, ...string[]]) =>
  z.union([z.enum(choices), z.literal("")]).optional().default("");

export const phoneSchema = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const phone = normalizePhone(v);
    if (!phone) {
      ctx.addIssue({ code: "custom", message: "Please enter a valid 10-digit phone number" });
      return z.NEVER;
    }
    return phone;
  });

export const leadSchema = z.object({
  address: z.string().trim().min(5, "Please enter the property address").max(200),
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: phoneSchema,
  email: z.union([z.email("Please enter a valid email").max(200), z.literal("")]).optional().default(""),
  propertyType: optionalChoice(values(PROPERTY_TYPES)),
  condition: optionalChoice(values(CONDITIONS)),
  timeline: optionalChoice(values(TIMELINES)),
  occupancy: optionalChoice(values(OCCUPANCY)),
  reason: optionalChoice([...REASONS]),
  notes: optionalText(2000),
  smsConsent: z.boolean().optional().default(false),
  // Attribution, filled in by the form.
  page: optionalText(300),
  referrer: optionalText(500),
  utm: z.record(z.string(), z.string().max(200)).optional().default({}),
  // Spam signals.
  startedAt: z.number().optional(),
  website: optionalText(200),
});

export type LeadInput = z.output<typeof leadSchema>;

export type Lead = Omit<LeadInput, "website" | "startedAt"> & {
  id: string;
  receivedAt: string;
  userAgent: string;
};

export function toLead(input: LeadInput, userAgent: string): Lead {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { website, startedAt, ...rest } = input;
  return { ...rest, id: crypto.randomUUID(), receivedAt: new Date().toISOString(), userAgent: userAgent.slice(0, 300) };
}

const label = (options: readonly { value: string; label: string }[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value;

function leadRows(lead: Lead): [string, string][] {
  const rows: [string, string][] = [
    ["Property address", lead.address],
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Email", lead.email],
    ["Property type", lead.propertyType && label(PROPERTY_TYPES, lead.propertyType)],
    ["Condition", lead.condition && label(CONDITIONS, lead.condition)],
    ["Timeline", lead.timeline && label(TIMELINES, lead.timeline)],
    ["Occupancy", lead.occupancy && label(OCCUPANCY, lead.occupancy)],
    ["Situation", lead.reason],
    ["In their words", lead.notes],
    ["OK to text", lead.smsConsent ? "Yes" : "No"],
    ["Submitted from", lead.page],
    ["Referrer", lead.referrer],
    ...Object.entries(lead.utm).map(([k, v]) => [k, v] as [string, string]),
    ["Received", lead.receivedAt],
    ["Lead ID", lead.id],
  ];
  return rows.filter(([, v]) => v);
}

export function leadEmail(lead: Lead) {
  const { html, text } = rowsEmail(`New seller lead from ${site.name}`, leadRows(lead), lead.name, lead.phone);
  return { subject: `New seller lead: ${lead.address}`, html, text, replyTo: lead.email || undefined, fromName: site.name };
}

/** The Seller Leads record for a web lead. */
export function sellerAirtableFields(lead: Lead, now = new Date()): Record<string, unknown> {
  const f = airtable.seller.fields;
  const motivation = [lead.reason, lead.notes].filter(Boolean).join(": ");
  const notes = [
    `Website lead, ${new Date(lead.receivedAt).toLocaleString("en-CA", { timeZone: airtable.timeZone })}`,
    `OK to text: ${lead.smsConsent ? "Yes (ticked the consent box)" : "No"}`,
    lead.page && `Page: ${lead.page}`,
    lead.referrer && `Referrer: ${lead.referrer}`,
    Object.keys(lead.utm).length > 0 && `Campaign: ${Object.entries(lead.utm).map(([k, v]) => `${k}=${v}`).join(", ")}`,
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

export async function deliverLead(lead: Lead, env: Env = process.env, fetchImpl: Fetch = fetch) {
  const jobs = standardJobs(env, fetchImpl, { type: "seller_lead", source: site.url, ...lead }, () => leadEmail(lead));
  if (airtableConfigured(env)) {
    jobs.unshift({
      name: "airtable",
      run: async () => {
        await createAirtableRecord({
          table: airtable.seller.table,
          fields: sellerAirtableFields(lead),
          required: [airtable.seller.fields.address],
          notesField: airtable.seller.fields.notes,
          env,
          fetchImpl,
        });
      },
    });
  }
  return runDeliveries(jobs, lead, "leads");
}

export async function handleLeadRequest(
  request: Request,
  deps: { env?: Env; fetchImpl?: Fetch; now?: number } = {},
): Promise<Response> {
  if (!rateLimit(`lead:${clientIp(request)}`, deps.now)) {
    return json({ ok: false, error: `Too many requests. Please call or text us at ${site.phone}.` }, 429);
  }

  const read = await readJson(request);
  if ("error" in read) return read.error;

  const parsed = leadSchema.safeParse(read.body);
  if (!parsed.success) {
    return json({ ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error.issues) }, 400);
  }

  // Pretend spam succeeded so bots don't learn what tripped the filter.
  if (isLikelySpam(parsed.data, deps.now)) return json({ ok: true });

  const lead = toLead(parsed.data, request.headers.get("user-agent") ?? "");
  const result = await deliverLead(lead, deps.env, deps.fetchImpl);

  if (result.configured > 0 && result.delivered.length === 0) {
    return json({ ok: false, error: `Sorry, something went wrong on our end. Please call or text us at ${site.phone}.` }, 502);
  }
  return json({ ok: true, id: lead.id });
}
