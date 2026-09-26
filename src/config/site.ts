/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE CONFIGURATION — edit this file first.
 *
 *  Everything business-specific (name, phone, market, promises) lives here and
 *  flows into every page, the structured data Google reads, the sitemap, and
 *  the lead emails. Values marked "REPLACE" are placeholders: `next build`
 *  prints a warning while any of them are still in place.
 *
 *  Service areas (city landing pages) live in `src/content/locations.ts`.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type Testimonial = {
  /** Real first name + last initial, e.g. "Denise R." Only publish real, permissioned reviews. */
  name: string;
  /** e.g. "Inherited house in Decatur" */
  context: string;
  quote: string;
  /** 1–5 */
  rating?: number;
};

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  /** Path under /public, e.g. "/images/team/jane.jpg" */
  photo?: string;
};

export const site = {
  /** REPLACE: your public business name, exactly as it appears on Google Business Profile. */
  name: "Acme Home Buyers",
  /** REPLACE: registered legal entity, used in the footer and legal pages. */
  legalName: "Acme Home Buyers LLC",
  /** Short brand promise used in the header logo lockup and social cards. */
  tagline: "Fair cash offers. Fast, simple closings.",

  /**
   * REPLACE: your production URL (no trailing slash). The NEXT_PUBLIC_SITE_URL
   * environment variable overrides this, which is handy for staging.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com").replace(/\/$/, ""),

  /** REPLACE: the number sellers should call or text. Keep the same format everywhere (NAP consistency). */
  phone: "(555) 555-0123",
  /** REPLACE: inbox for sellers. Lead notifications go to LEAD_EMAIL_TO instead. */
  email: "offers@example.com",

  /**
   * Physical address. Leave `street` empty if you run a service-area business
   * without a public office (the same way you would on Google Business Profile);
   * the site then shows only the city/state and omits the street from schema.
   */
  address: {
    street: "",
    city: "Atlanta",
    region: "GA",
    postalCode: "",
    country: "US",
  },

  /** Your primary market. Drives headlines like "Sell Your House Fast in …". */
  market: {
    /** Used in headlines: "We buy houses in {name}". */
    name: "Atlanta",
    /** Used in body copy for the wider metro: "homeowners across {region}". */
    region: "Metro Atlanta",
    state: "Georgia",
    stateAbbr: "GA",
    /** Approximate center of your market, used in LocalBusiness schema. */
    geo: { latitude: 33.749, longitude: -84.388 },
  },

  /** Hours shown on the site and in structured data (24h clock). */
  hours: {
    label: "Mon–Sat, 8am–8pm",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "08:00",
    closes: "20:00",
  },

  /**
   * The promises your copy makes. Only claim what you actually deliver —
   * these numbers appear in headlines, FAQs and comparison tables.
   */
  promises: {
    /** Fastest closing you can reliably do (days). */
    closeInDays: 7,
    /** How quickly you send an offer after talking to the seller (hours). */
    offerWithinHours: 24,
    /** Do you pay the seller's normal closing costs? */
    paysClosingCosts: true,
  },

  /**
   * Transparency statement shown in the footer, terms and FAQ. Many states now
   * require wholesalers to disclose that they may assign the contract; being
   * upfront also builds trust. Have your attorney review it for your state.
   */
  disclosure:
    "We are real estate investors, not licensed real estate agents or brokers, and we do not list homes for sale. When you accept our offer, we sign a purchase contract to buy your property. We may close on the purchase ourselves or assign our contract to another investor or buyer, and we will tell you in writing before you sign.",

  /** Year the business started. Leave undefined to hide "since …" copy. */
  foundedYear: undefined as number | undefined,

  /** Links to your profiles. Empty strings are ignored. Used for schema `sameAs`. */
  social: {
    googleBusinessProfile: "",
    facebook: "",
    instagram: "",
    youtube: "",
    linkedin: "",
    bbb: "",
  },

  /**
   * Real reviews only — publishing invented testimonials violates the FTC's
   * rule on fake reviews. The testimonials section stays hidden until you add some.
   */
  testimonials: [] as Testimonial[],

  /** Real people build trust (and E-E-A-T). The team section stays hidden until you add someone. */
  team: [] as TeamMember[],
} as const;

export type Site = typeof site;

/** Digits-only phone for tel:/sms: links, e.g. "+15555550123". */
export const phoneHref = `+1${site.phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "")}`;

/** Full display address: street (if any), city, state zip. */
export function formatAddress(): string {
  const { street, city, region, postalCode } = site.address;
  const cityLine = [city, [region, postalCode].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return [street, cityLine].filter(Boolean).join(", ");
}

/** Values still set to the template's placeholders — reported at build time. */
export function placeholderWarnings(): string[] {
  const warnings: string[] = [];
  if (site.name === "Acme Home Buyers") warnings.push("site.name is still the placeholder \"Acme Home Buyers\"");
  if (site.url.includes("example.com")) warnings.push("site.url / NEXT_PUBLIC_SITE_URL still points at example.com");
  if (site.phone.includes("555")) warnings.push("site.phone is still a 555 placeholder number");
  if (site.email.endsWith("@example.com")) warnings.push("site.email is still an example.com address");
  return warnings;
}
