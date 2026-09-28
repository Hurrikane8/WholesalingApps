/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE CONFIGURATION — edit this file first.
 *
 *  Everything business-specific (name, phone, market, founder, promises)
 *  lives here and flows into every page, the structured data Google reads,
 *  the sitemap and the lead emails.
 *
 *  Promises only reach a page through src/lib/claims.ts, and only once their
 *  `verified` flag is true. `next build` lists everything still unconfirmed.
 *
 *  Service areas: src/content/locations.ts. Airtable mapping: src/config/airtable.ts.
 *
 *  Imports here must be relative (no "@/" alias): next.config.ts loads this file.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { PropertyTypeValue } from "../lib/lead-options";

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

export type Founder = {
  firstName: string;
  lastName: string;
  role: string;
  /** Real photos only, e.g. "/images/kane/portrait.jpg". */
  photo: string;
  /** e.g. "Kane on a residential street in Edmonton" */
  photoAlt: string;
  /** One or two sentences in Kane's words. */
  shortBio: string;
  /** Optional, e.g. "/brand/signature.svg", traced from Kane's real signature. */
  signature: string;
  linkedin: string;
  /** Optional 60–90 s intro: MP4 (12 MB or less) + poster + WebVTT captions. */
  video: { src: string; poster: string; captions: string };
};

/**
 * Claims that only render once Kane confirms them. The first three are the
 * brand pillars Kane approved in September 2026.
 */
export type VerifiedFlag =
  | "explainsOfferMath"
  | "tellsWhenListingWins"
  | "assignmentDisclosedBeforeSigning"
  | "showsMarginInWriting"
  | "noRetrades"
  | "closeInDays"
  | "offerWithinHours"
  | "coversLegalFees";

export type PropertyTypeConfig = {
  /** A PROPERTY_TYPES value (an Airtable choice). */
  value: PropertyTypeValue;
  /** Show it on the site (hub, form chips, lists). */
  show: boolean;
  /** Plural, for headings and lists: "Condo townhouses". */
  plural: string;
  /** Singular, lower-case, for sentences: "condo townhouse". */
  singular: string;
  /** One line under the name. */
  note: string;
};

/** The person sellers deal with. Empty strings render nothing. */
const founder: Founder = {
  firstName: "Kane",
  lastName: "", // TO CONFIRM (optional)
  role: "Founder",
  photo: "",
  photoAlt: "",
  shortBio: "", // TO CONFIRM: one or two sentences in Kane's words
  signature: "",
  linkedin: "",
  video: { src: "", poster: "", captions: "" },
};

/** Flip a flag to true only after Kane confirms it. Unconfirmed claims never render in production. */
const verified: Record<VerifiedFlag, boolean> = {
  explainsOfferMath: true, // offers come with the ARV, repairs and costs explained
  tellsWhenListingWins: true, // Kane says so when listing would likely net more
  assignmentDisclosedBeforeSigning: true, // matches site.disclosure; lawyer to review the wording
  showsMarginInWriting: false, // TO CONFIRM: written offers itemize the profit line too
  noRetrades: false, // TO CONFIRM: no price cuts after agreement unless something new and material turns up
  closeInDays: false, // TO CONFIRM: promises.closeInDays is reliably achievable
  offerWithinHours: false, // TO CONFIRM: promises.offerWithinHours is reliably achievable
  coversLegalFees: false, // TO CONFIRM: Kane pays the seller's standard legal fees
};

/**
 * Property types shown on the site, in display order; the first is the
 * current focus. To start or stop showing a type, flip `show`. To give a type
 * its own page, add content/property-types/<slug>.md (docs/content-playbook.md).
 */
const propertyTypes: PropertyTypeConfig[] = [
  { value: "Condo townhouse", show: true, plural: "Condo townhouses", singular: "condo townhouse", note: "Including complexes with high fees, a special assessment or big repairs coming." },
  { value: "Single family", show: true, plural: "Houses", singular: "house", note: "Bungalows, split-levels and two-storeys, from dated to damaged." },
  { value: "Half duplex", show: true, plural: "Half duplexes", singular: "half duplex", note: "Either side, with or without a basement suite." },
  { value: "Freehold townhouse", show: true, plural: "Freehold townhouses", singular: "freehold townhouse", note: "Row and end units without condo fees." },
  { value: "Apartment condo", show: true, plural: "Apartment condos", singular: "apartment condo", note: "Older buildings and units that need work." },
  { value: "Multifamily", show: true, plural: "Duplexes to fourplexes", singular: "small multi-unit building", note: "Up-down duplexes to fourplexes, tenants in place." },
];

/**
 * The site's public origin (no trailing slash): NEXT_PUBLIC_SITE_URL once
 * there's a domain, else Vercel's production address, else localhost.
 * Never read site.url in a client component; pass it down as a prop.
 */
export function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  // `||`, not `??`: an empty variable counts as unset.
  const vercel = (process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL)?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const site = {
  /** Public business name, exactly as it will appear on Google Business Profile. */
  name: "Aurora Home Buyers",
  /** Registered legal name. TO CONFIRM once the business is registered. */
  legalName: "Aurora Home Buyers",
  tagline: "Straight answers on selling your home.",

  url: resolveSiteUrl(),

  /**
   * The number sellers call or text. Use the same format everywhere (Google
   * Business Profile, directories, flyers). TO CONFIRM: the long-term number.
   */
  phone: "(780) 836-5156",
  /** Public inbox for sellers. Leave empty to hide email everywhere. Lead alerts go to LEAD_EMAIL_TO. */
  email: "",

  /**
   * Physical address. Leave `street` empty for a service-area business
   * (no public office); the site then shows only the city.
   */
  address: {
    street: "",
    city: "Edmonton",
    region: "AB",
    postalCode: "",
    country: "CA",
  },

  market: {
    name: "Edmonton",
    region: "Greater Edmonton",
    province: "Alberta",
    provinceAbbr: "AB",
    /** Approximate centre of the market, used in LocalBusiness schema. */
    geo: { latitude: 53.5461, longitude: -113.4938 },
  },

  /** Hours shown on the site and in structured data (24h clock). TO CONFIRM. */
  hours: {
    label: "Mon–Sat, 8am–8pm",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "08:00",
    closes: "20:00",
  },

  /**
   * The numbers behind the speed promises. They only reach a page through
   * src/lib/claims.ts, and only when their `verified` flag is true.
   */
  promises: {
    closeInDays: 7,
    offerWithinHours: 24,
    coversLegalFees: verified.coversLegalFees,
  },

  /**
   * Shown in the footer of every page and on Terms, FAQ, About and How it
   * works. Have an Alberta real estate lawyer review the wording.
   */
  disclosure:
    "We are real estate investors, not licensed real estate professionals, and we do not list homes for sale. When you accept our offer, we sign a purchase contract to buy your property. We may complete the purchase ourselves or assign our contract to another investor, and we will tell you in writing before you sign.",

  founder,

  /** What happens after a seller submits. Only promise what can always be kept. */
  responsePromise: {
    /** TO CONFIRM, e.g. "within 2 hours". Empty means no promise. */
    duringHours: "",
    afterHours: "the next morning",
  },

  verified,

  /** TO CONFIRM: how many days a written offer stays open. */
  offerStaysOpenDays: null as number | null,

  /** Optional free Cal.com (or similar) link for booking the first call. */
  bookingUrl: "",

  propertyTypes,

  /** Year the business started. Leave undefined to hide "since …" copy. */
  foundedYear: undefined as number | undefined,

  /** Profile links, used for schema `sameAs` once they exist. Empty strings are ignored. */
  social: {
    googleBusinessProfile: "",
    facebook: "",
    instagram: "",
    youtube: "",
    linkedin: "",
  },

  /**
   * Real reviews only — invented testimonials are deceptive marketing under
   * Canada's Competition Act. The section stays hidden until you add some.
   */
  testimonials: [] as Testimonial[],

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

/** The property types currently shown on the site, in display order. */
export function shownPropertyTypes(): PropertyTypeConfig[] {
  return site.propertyTypes.filter((t) => t.show);
}
