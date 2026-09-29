/**
 * Investor / buyers list signups (POST /api/buyers, spec 4.9): validation and
 * spam filtering as before; delivery goes through the sinks (Airtable Buyers,
 * webhooks such as the Sheets "Buyers" tab, and the owner email).
 */
import { z } from "zod";
import { site } from "@/config/site";
import { airtable } from "@/config/airtable";
import { BUYER_CONSENT_TEXT } from "@/content/consent";
import { deployEnv, type DeployEnv } from "@/lib/env";
import { clientIp, fieldErrors, isLikelySpam, json, rateLimit, readJson, type Env, type Fetch } from "@/lib/delivery";
import { phoneSchema } from "@/lib/schemas";
import { FINANCING, PROPERTY_TYPES, STRATEGIES, TARGET_AREAS, values } from "@/lib/lead-options";
import { deliver } from "@/lib/sinks";

const optionalText = (max: number) => z.string().trim().max(max).optional().default("");
const choices = (options: Parameters<typeof values>[0], max = 20) =>
  z.array(z.enum(values(options))).max(max).optional().default([]);
const money = z.number().min(0).max(100_000_000).optional();

export const buyerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.email("Enter an email like name@example.ca").max(200),
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
  consent: z.boolean().refine((v) => v, "Tick the box to join the list: it's how I get your consent to send deals"),
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

export function toBuyer(input: BuyerInput, userAgent: string, now = new Date()): Buyer {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { website, startedAt, ...rest } = input;
  return { ...rest, id: crypto.randomUUID(), receivedAt: now.toISOString(), userAgent: userAgent.slice(0, 300) };
}

/** The CASL consent record kept with every signup. */
export function consentRecord(b: Buyer): string {
  const when = new Date(b.receivedAt).toLocaleString("en-CA", { timeZone: airtable.timeZone });
  return `CASL express consent given ${when} via ${site.url}${b.page || "/investors"}: "${BUYER_CONSENT_TEXT}"`;
}

export function hasCriteria(b: Buyer): boolean {
  return Boolean(b.strategies.length || b.propertyTypes.length || b.targetAreas.length || b.maxPrice);
}

export const BUYER_UNDELIVERED = `That didn't go through. Please call or text me at ${site.phone}, or try again in a minute.`;

export async function handleBuyerRequest(
  request: Request,
  deps: { env?: Env; fetchImpl?: Fetch; now?: number; mode?: DeployEnv } = {},
): Promise<Response> {
  const env = deps.env ?? process.env;
  const now = deps.now ?? Date.now();
  if (!rateLimit(`buyer:${clientIp(request)}`, now)) {
    return json({ ok: false, error: `Too many requests. Please call or text me at ${site.phone}.` }, 429);
  }

  const read = await readJson(request);
  if ("error" in read) return read.error;

  const parsed = buyerSchema.safeParse(read.body);
  if (!parsed.success) {
    return json({ ok: false, error: "Please fix the fields marked below.", fieldErrors: fieldErrors(parsed.error.issues) }, 400);
  }
  if (isLikelySpam(parsed.data, now)) return json({ ok: true });

  const buyer = toBuyer(parsed.data, request.headers.get("user-agent") ?? "", new Date(now));
  const result = await deliver("buyer_signup", buyer, { env, fetchImpl: deps.fetchImpl ?? fetch });
  if (result.delivered.length === 0) {
    if (result.configured === 0 && (deps.mode ?? deployEnv()) === "development") {
      console.warn("[buyers] No destination is configured (fine in development). The signup:", JSON.stringify(buyer));
    } else {
      console.error(`[buyer:undelivered] ${JSON.stringify(buyer)}`);
      return json({ ok: false, undelivered: true, error: BUYER_UNDELIVERED }, 502);
    }
  }
  return json({ ok: true, id: buyer.id });
}
