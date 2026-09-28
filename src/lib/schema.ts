/**
 * JSON-LD structured data builders (https://schema.org). Google and AI search
 * engines use these to understand who the business is, where it operates and
 * what each page is about. Validate changes at https://validator.schema.org.
 */
import { phoneHref, site } from "@/config/site";
import type { Faq } from "@/content/faqs";
import type { Location } from "@/content/locations";
import { siteDescription } from "@/lib/claims";
import { absoluteUrl } from "@/lib/seo";

type Json = Record<string, unknown>;

export const ORG_ID = `${site.url}/#organization`;
const WEBSITE_ID = `${site.url}/#website`;

function sameAs(): string[] {
  return (Object.values(site.social) as string[]).filter(Boolean);
}

function postalAddress(): Json {
  const { street, city, region, postalCode, country } = site.address;
  return {
    "@type": "PostalAddress",
    ...(street ? { streetAddress: street } : {}),
    addressLocality: city,
    addressRegion: region,
    ...(postalCode ? { postalCode } : {}),
    addressCountry: country,
  };
}

/**
 * The business itself. Rendered once, site-wide, from the root layout.
 *
 * No aggregateRating here on purpose: Google doesn't show review stars for
 * reviews a business publishes about itself. Earn stars on your Google
 * Business Profile instead.
 */
export function localBusinessSchema(): Json {
  const { hours, market } = site;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": ORG_ID,
    name: site.name,
    legalName: site.legalName,
    description: siteDescription(),
    url: site.url,
    logo: absoluteUrl("/icon.svg"),
    image: absoluteUrl("/opengraph-image"),
    telephone: phoneHref,
    ...(site.email ? { email: site.email } : {}),
    address: postalAddress(),
    geo: { "@type": "GeoCoordinates", ...market.geo },
    areaServed: [
      { "@type": "AdministrativeArea", name: `${market.province}, Canada` },
      { "@type": "AdministrativeArea", name: market.region },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: hours.days,
        opens: hours.opens,
        closes: hours.closes,
      },
    ],
    ...(site.foundedYear ? { foundingDate: String(site.foundedYear) } : {}),
    ...(sameAs().length ? { sameAs: sameAs() } : {}),
    knowsAbout: [
      "Selling a house for cash",
      "Selling a house as-is",
      "Selling a condo townhouse",
      "Avoiding foreclosure in Alberta",
      "Selling inherited and estate property",
      "Selling rental property with tenants",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: phoneHref,
      contactType: "customer service",
      areaServed: "CA",
      availableLanguage: "English",
    },
  };
}

export function websiteSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.url,
    name: site.name,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-CA",
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbSchema(crumbs: Crumb[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function faqSchema(items: Faq[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** "We buy houses for cash" as a service, optionally scoped to one city. */
export function serviceSchema(opts: { name: string; description: string; path: string; location?: Location }): Json {
  const { location } = opts;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    serviceType: "Cash home buying",
    description: opts.description,
    url: absoluteUrl(opts.path),
    provider: { "@id": ORG_ID },
    areaServed: location
      ? {
          "@type": "City",
          name: `${location.city}, ${location.provinceAbbr}`,
          containedInPlace: { "@type": "AdministrativeArea", name: location.region ?? site.market.region },
          ...(location.geo ? { geo: { "@type": "GeoCoordinates", ...location.geo } } : {}),
        }
      : { "@type": "AdministrativeArea", name: site.market.region },
    offers: {
      "@type": "Offer",
      description: "Free, no-obligation cash offer",
      price: "0",
      priceCurrency: "CAD",
    },
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  /** Path of the article's social image. */
  image?: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    description: opts.description,
    url: absoluteUrl(opts.path),
    mainEntityOfPage: absoluteUrl(opts.path),
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    image: absoluteUrl(opts.image ?? "/opengraph-image"),
    author: opts.author ? { "@type": "Person", name: opts.author } : { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    inLanguage: "en-CA",
  };
}
