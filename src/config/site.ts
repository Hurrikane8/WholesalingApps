/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE CONFIGURATION — edit this file first.
 *
 *  Everything business-specific (name, phone, market, promises) lives here and
 *  flows into every page, the structured data Google reads, the sitemap, and
 *  the lead emails. `next build` prints a warning while any placeholder is
 *  still in place.
 *
 *  Service areas (city landing pages) live in `src/content/locations.ts`.
 *  Airtable field mapping lives in `src/config/airtable.ts`.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type Testimonial = {
  /** Real first name + last initial, e.g. "Denise R." Only publish real, permissioned reviews. */
  name: string;
  /** e.g. "Condo townhouse in Mill Woods" */
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
  /** Public business name, exactly as it will appear on Google Business Profile. */
  name: "Aurora Home Buyers",
  /** Registered legal name (update once the business is registered, e.g. "Aurora Home Buyers Ltd."). */
  legalName: "Aurora Home Buyers",
  /** Short brand promise used in social cards. */
  tagline: "Fair cash offers. Fast, simple closings.",
  /** Why the business is called what it is. Shown on the About page. Leave empty to hide. */
  nameStory:
    "Aurora was the original name of Manning, Alberta, the northern Alberta town where our founder grew up. The name is a nod to home.",

  /**
   * The site's public address (no trailing slash), used for canonical URLs,
   * share links, the sitemap and structured data. Set NEXT_PUBLIC_SITE_URL once
   * you have a domain. Until then, on Vercel it falls back to the project's
   * production address (e.g. your-project.vercel.app).
   */
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://www.example.com")
  ).replace(/\/$/, ""),

  /**
   * The number sellers call or text. Use the same format everywhere (Google
   * Business Profile, directories, flyers). Switch it here once the Quo
   * business line is set up.
   */
  phone: "(780) 836-5156",
  /** Public inbox for sellers. Leave empty to hide email everywhere. Lead notifications go to LEAD_EMAIL_TO. */
  email: "",

  /**
   * Physical address. Leave `street` empty if you work from home or don't meet
   * sellers at an office (a "service-area business" on Google Business Profile);
   * the site then shows only the city and omits the street from structured data.
   */
  address: {
    street: "",
    city: "Edmonton",
    region: "AB",
    postalCode: "",
    country: "CA",
  },

  /** Your primary market. Drives headlines like "Sell Your House Fast in …". */
  market: {
    /** Used in headlines: "We buy houses in {name}". */
    name: "Edmonton",
    /** Used in body copy for the wider area: "homeowners across {region}". */
    region: "Greater Edmonton",
    province: "Alberta",
    provinceAbbr: "AB",
    /** Approximate centre of your market, used in LocalBusiness schema. */
    geo: { latitude: 53.5461, longitude: -113.4938 },
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
   * these appear in headlines, FAQs and comparison tables.
   */
  promises: {
    /** Fastest closing you can reliably do (days), lawyers included. */
    closeInDays: 7,
    /** How quickly you send an offer after seeing the property (hours). */
    offerWithinHours: 24,
    /** Do you pay the seller's standard real estate lawyer fees? */
    coversLegalFees: true,
  },

  /**
   * Transparency statement shown in the footer, terms, FAQ and About page.
   * Being upfront about assignments builds trust. Have an Alberta real estate
   * lawyer review it (see the RECA note in docs/seo-playbook.md).
   */
  disclosure:
    "We are real estate investors, not licensed real estate professionals, and we do not list homes for sale. When you accept our offer, we sign a purchase contract to buy your property. We may complete the purchase ourselves or assign our contract to another investor, and we will tell you in writing before you sign.",

  /** Year the business started. Leave undefined to hide "since …" copy. */
  foundedYear: undefined as number | undefined,

  /** Links to your profiles. Empty strings are ignored. Used for schema `sameAs`. */
  social: {
    googleBusinessProfile: "",
    facebook: "",
    instagram: "",
    youtube: "",
    linkedin: "",
  },

  /**
   * Real reviews only — publishing invented testimonials is deceptive
   * marketing under Canada's Competition Act. The section stays hidden until
   * you add some.
   */
  testimonials: [] as Testimonial[],

  /** Real people build trust (and E-E-A-T). The team section stays hidden until you add someone. */
  team: [] as TeamMember[],
} as const;

export type Site = typeof site;

/** Digits-only phone for tel:/sms: links, e.g. "+17808365156". */
export const phoneHref = `+1${site.phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "")}`;

/** Display location: street (if any), city, province postal code. */
export function formatAddress(): string {
  const { street, city, region, postalCode } = site.address;
  const cityLine = [city, [region, postalCode].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return [street, cityLine].filter(Boolean).join(", ");
}

/** Values still set to template placeholders — reported at build time. */
export function placeholderWarnings(): string[] {
  const warnings: string[] = [];
  if (site.url.includes("example.com")) warnings.push("site.url / NEXT_PUBLIC_SITE_URL still points at example.com");
  if (site.phone.includes("555")) warnings.push("site.phone is still a 555 placeholder number");
  if ((site.email as string).endsWith("@example.com")) warnings.push("site.email is still an example.com address");
  return warnings;
}
