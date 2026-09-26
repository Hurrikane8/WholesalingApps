/** Select options shared by the lead form (client) and the lead API (server). */

export const CONDITIONS = [
  "Move-in ready",
  "Needs minor repairs",
  "Needs major repairs",
  "Uninhabitable / heavy damage",
] as const;

export const TIMELINES = [
  "ASAP (within 2 weeks)",
  "Within 30 days",
  "1–3 months",
  "3+ months",
  "Just exploring options",
] as const;

export const REASONS = [
  "Behind on payments / foreclosure",
  "Back taxes or liens",
  "Inherited / probate",
  "Divorce or separation",
  "Relocating",
  "Tired landlord / tenant issues",
  "Repairs I can't afford",
  "Downsizing",
  "Vacant property",
  "Fire, water or storm damage",
  "Other",
] as const;

export type Reason = (typeof REASONS)[number];

/**
 * Normalizes a US phone number to "(555) 555-0123", or returns null if it
 * isn't a plausible 10-digit number.
 */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length !== 10 || !/^[2-9]\d{2}[2-9]/.test(digits)) return null;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
