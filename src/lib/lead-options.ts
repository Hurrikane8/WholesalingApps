/**
 * Form options shared by the lead forms (client) and the lead APIs (server).
 *
 * Each `value` is written to Airtable exactly as-is, so it must match a choice
 * in the corresponding single/multiple select field of the "Wholesaling CRM"
 * base (see src/config/airtable.ts). `label` is what visitors see.
 */

export type Option = { readonly value: string; readonly label: string };

export const values = (options: readonly Option[]) => options.map((o) => o.value) as [string, ...string[]];

/* ─── Seller form → Seller Leads table ──────────────────────────────────── */

/**
 * Seller Leads › Property Type, and Buyers › Property Types. Which types the
 * site shows, and in what order, is set in site.propertyTypes.
 */
export const PROPERTY_TYPES = [
  { value: "Single family", label: "House" },
  { value: "Half duplex", label: "Half duplex" },
  { value: "Condo townhouse", label: "Condo townhouse" },
  { value: "Freehold townhouse", label: "Townhouse, no condo fees" },
  { value: "Apartment condo", label: "Apartment condo" },
  { value: "Multifamily", label: "Duplex to fourplex" },
] as const satisfies readonly Option[];

export type PropertyTypeValue = (typeof PROPERTY_TYPES)[number]["value"];

export function isPropertyTypeValue(value: unknown): value is PropertyTypeValue {
  return PROPERTY_TYPES.some((t) => t.value === value);
}

/** Seller Leads › Condition. */
export const CONDITIONS = [
  { value: "Move-in ready", label: "Move-in ready" },
  { value: "Light reno", label: "Needs some updating" },
  { value: "Heavy reno", label: "Needs major work" },
] as const satisfies readonly Option[];

/** Seller Leads › Timeline. */
export const TIMELINES = [
  { value: "ASAP", label: "As soon as possible" },
  { value: "1-3 months", label: "Within 1–3 months" },
  { value: "3-6 months", label: "Within 3–6 months" },
  { value: "6+ months", label: "6+ months" },
  { value: "Unknown", label: "Just exploring options" },
] as const satisfies readonly Option[];

/** Seller Leads › Occupancy. */
export const OCCUPANCY = [
  { value: "Owner-occupied", label: "I live there" },
  { value: "Tenanted", label: "Tenants live there" },
  { value: "Vacant", label: "It's vacant" },
] as const satisfies readonly Option[];

/** Why they're selling. Written to Seller Leads › Motivation (free text). */
export const REASONS = [
  "Behind on payments / foreclosure",
  "Back taxes or liens",
  "Inherited / probate",
  "Divorce or separation",
  "Relocating",
  "Tired landlord / tenant issues",
  "Repairs I can't afford",
  "Condo fees or special assessment",
  "Downsizing",
  "Vacant property",
  "Fire, water or storm damage",
  "Other",
] as const;

export type Reason = (typeof REASONS)[number];

/* ─── Investor form → Buyers table ──────────────────────────────────────── */

/** Buyers › Strategy. */
export const STRATEGIES = [
  { value: "Flip", label: "Fix & flip" },
  { value: "BRRRR", label: "BRRRR" },
  { value: "Buy & hold", label: "Buy & hold rentals" },
  { value: "Rent to own", label: "Rent to own" },
  { value: "Wholesale / JV", label: "Wholesale / JV" },
] as const satisfies readonly Option[];

/** Buyers › Financing Type. */
export const FINANCING = [
  { value: "Cash", label: "Cash" },
  { value: "Private / hard money", label: "Private / hard money" },
  { value: "Bank / conventional", label: "Bank / conventional mortgage" },
  { value: "JV partner", label: "JV partner" },
] as const satisfies readonly Option[];

/** Buyers › Target Areas. */
export const TARGET_AREAS = [
  { value: "Anywhere in Edmonton", label: "Anywhere in Edmonton" },
  { value: "Central / mature", label: "Central / mature neighbourhoods" },
  { value: "North Edmonton", label: "North Edmonton" },
  { value: "NE Edmonton", label: "Northeast Edmonton" },
  { value: "West Edmonton", label: "West Edmonton" },
  { value: "South Edmonton", label: "South Edmonton" },
  { value: "Millwoods", label: "Mill Woods" },
  { value: "St. Albert", label: "St. Albert" },
  { value: "Sherwood Park", label: "Sherwood Park" },
  { value: "Spruce Grove / Stony Plain", label: "Spruce Grove / Stony Plain" },
  { value: "Leduc", label: "Leduc" },
  { value: "Beaumont", label: "Beaumont" },
  { value: "Fort Saskatchewan", label: "Fort Saskatchewan" },
  { value: "Outside greater Edmonton", label: "Outside Greater Edmonton" },
] as const satisfies readonly Option[];

/**
 * Normalizes a North American (Canada/US) phone number to "(780) 555-0123",
 * or returns null if it isn't a plausible 10-digit number.
 */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length !== 10 || !/^[2-9]\d{2}[2-9]/.test(digits)) return null;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
