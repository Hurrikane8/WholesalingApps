/**
 * Attribution sent with seller leads and opt-outs (spec 8.2): the first
 * touch (kept 30 days in the browser) and the last touch (this visit).
 * Server-side schema and formatting; the browser side is src/lib/attribution.ts.
 */
import { z } from "zod";

export const touchSchema = z
  .object({
    /** utm_*, gclid, fbclid, msclkid */
    params: z.record(z.string().max(40), z.string().max(200)).optional().default({}),
    landingPage: z.string().trim().max(300).optional().default(""),
    referrer: z.string().trim().max(500).optional().default(""),
    /** ISO time */
    at: z.string().trim().max(40).optional().default(""),
  })
  .optional();

export type Touch = NonNullable<z.output<typeof touchSchema>>;

/** "utm_source=letter, utm_campaign=2026-10-letter" */
export function formatParams(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
}

/** One line for notes and emails, e.g. "First touch: /hello (utm_source=letter), from google.com, 2026-10-02". */
export function describeTouch(label: string, touch: Touch | undefined): string {
  if (!touch) return "";
  const parts = [
    touch.landingPage && `landed on ${touch.landingPage}`,
    Object.keys(touch.params).length > 0 && formatParams(touch.params),
    touch.referrer && `from ${touch.referrer}`,
    touch.at && touch.at.slice(0, 10),
  ].filter(Boolean);
  return parts.length ? `${label}: ${parts.join("; ")}` : "";
}

/** The campaign parameters that best explain this record: the last touch's, else the first's. */
export function campaignParams(record: { lastTouch?: Touch; firstTouch?: Touch; utm?: Record<string, string> }): Record<string, string> {
  if (record.lastTouch && Object.keys(record.lastTouch.params).length) return record.lastTouch.params;
  if (record.firstTouch && Object.keys(record.firstTouch.params).length) return record.firstTouch.params;
  return record.utm ?? {};
}
