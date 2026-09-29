/**
 * Opt-outs (POST /api/opt-out, spec 4.7): someone who got a letter, a door
 * hanger or a knock takes themselves off Kane's list. Same protection and the
 * same durable-delivery rules as seller leads.
 */
import { z } from "zod";
import { site } from "@/config/site";
import { deployEnv, type DeployEnv } from "@/lib/env";
import { clientIp, fieldErrors, isLikelySpam, json, rateLimit, readJson, type Env, type Fetch } from "@/lib/delivery";
import { OPT_OUT_CHANNELS, normalizePhone, values } from "@/lib/lead-options";
import { deliver } from "@/lib/sinks";
import { touchSchema } from "@/lib/touch";

const optionalText = (max: number) => z.string().trim().max(max).optional().default("");

export const optOutSchema = z.object({
  address: z.string().trim().min(5, "Enter the street address the letter or visit was about").max(200),
  name: optionalText(100),
  phone: z
    .string()
    .trim()
    .optional()
    .default("")
    .transform((v, ctx) => {
      if (!v) return "";
      const phone = normalizePhone(v);
      if (!phone) {
        ctx.addIssue({ code: "custom", message: "Enter a 10-digit phone number, or leave it blank" });
        return z.NEVER;
      }
      return phone;
    }),
  email: z.union([z.email("Enter an email like name@example.ca, or leave it blank").max(200), z.literal("")]).optional().default(""),
  channel: z.union([z.enum(values(OPT_OUT_CHANNELS)), z.literal("")]).optional().default(""),
  notes: optionalText(1000),
  // Attribution.
  page: optionalText(300),
  firstTouch: touchSchema,
  lastTouch: touchSchema,
  // Spam signals.
  startedAt: z.number().optional(),
  website: optionalText(200),
});

export type OptOutInput = z.output<typeof optOutSchema>;
export type OptOut = Omit<OptOutInput, "website" | "startedAt"> & { id: string; receivedAt: string };

export function toOptOut(input: OptOutInput, now = new Date()): OptOut {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { website, startedAt, ...rest } = input;
  return { ...rest, id: crypto.randomUUID(), receivedAt: now.toISOString() };
}

export const OPT_OUT_UNDELIVERED = `That didn't go through. Please call or text me at ${site.phone} and I'll take you off my list.`;

export async function handleOptOutRequest(
  request: Request,
  deps: { env?: Env; fetchImpl?: Fetch; now?: number; mode?: DeployEnv } = {},
): Promise<Response> {
  const env = deps.env ?? process.env;
  const now = deps.now ?? Date.now();
  if (!rateLimit(`optout:${clientIp(request)}`, now)) {
    return json({ ok: false, error: `Too many requests. Please call or text me at ${site.phone}.` }, 429);
  }

  const read = await readJson(request);
  if ("error" in read) return read.error;

  const parsed = optOutSchema.safeParse(read.body);
  if (!parsed.success) {
    return json({ ok: false, error: "Please fix the fields marked below.", fieldErrors: fieldErrors(parsed.error.issues) }, 400);
  }
  if (isLikelySpam(parsed.data, now)) return json({ ok: true });

  const optOut = toOptOut(parsed.data, new Date(now));
  const result = await deliver("opt_out", optOut, { env, fetchImpl: deps.fetchImpl ?? fetch });
  if (result.delivered.length === 0) {
    if (result.configured === 0 && (deps.mode ?? deployEnv()) === "development") {
      console.warn("[opt-out] No destination is configured (fine in development). The opt-out:", JSON.stringify(optOut));
    } else {
      console.error(`[opt-out:undelivered] ${JSON.stringify(optOut)}`);
      return json({ ok: false, undelivered: true, error: OPT_OUT_UNDELIVERED }, 502);
    }
  }
  return json({ ok: true, id: optOut.id });
}
