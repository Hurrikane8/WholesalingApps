import type { Metadata } from "next";
import { site } from "@/config/site";
import { isIndexable } from "@/lib/env";

/** Absolute URL for a site path, e.g. absoluteUrl("/faq") → "https://www.example.com/faq". */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized === "/" ? site.url : `${site.url}${normalized}`;
}

type PageMetadataInput = {
  /**
   * Page title without the brand suffix; " | {site.name}" is appended when the
   * result still fits in MAX_TITLE_LENGTH characters.
   */
  title: string;
  /** 120–160 characters. Written for humans: it's the snippet in search results. */
  description: string;
  /** Path of the canonical URL, e.g. "/we-buy-houses/st-albert-ab". */
  path: string;
  /** Set true for pages that shouldn't appear in search (thank-you, etc.). */
  noindex?: boolean;
  /** Use "article" for blog posts. */
  type?: "website" | "article";
  /** ISO dates for articles. */
  publishedTime?: string;
  modifiedTime?: string;
  /** Use the title exactly as given (no " | Brand" suffix). */
  absoluteTitle?: boolean;
  /**
   * The page's segment has its own opengraph-image file. Next then adds the
   * image itself, with the hashed URL it serves it at; a hand-written path
   * would 404. Every other page uses the site-wide /opengraph-image.
   */
  ownImage?: boolean;
};

/** Google typically shows about 60–65 characters of a title before truncating. */
export const MAX_TITLE_LENGTH = 65;

/**
 * Robots directives: nothing is indexed until the site is live on its real
 * domain (spec 7.1); after that, only pages marked noindex are kept out.
 */
export function robotsFor(noindex = false, indexable = isIndexable()): Metadata["robots"] {
  if (!indexable) return { index: false, follow: false };
  return noindex ? { index: false, follow: true } : undefined;
}

/**
 * Builds consistent metadata for a page: title, description, canonical URL,
 * Open Graph and Twitter cards. Every page should use this so no page ships
 * without a canonical or social preview.
 */
export function pageMetadata(input: PageMetadataInput): Metadata {
  const { title, description, path, noindex, type = "website", publishedTime, modifiedTime, absoluteTitle, ownImage } = input;
  // A page's openGraph replaces its parent's, so without its own card it has to name the site-wide one.
  const images = ownImage ? {} : { images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${site.name}: sell your ${site.market.name} home as-is` }] };
  const url = absoluteUrl(path);
  // Drop the " | Brand" suffix when it would push the title past what Google displays.
  const branded = `${title} | ${site.name}`;
  const useAbsolute = absoluteTitle || branded.length > MAX_TITLE_LENGTH;
  const socialTitle = useAbsolute ? title : branded;

  return {
    title: useAbsolute ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    robots: robotsFor(noindex),
    openGraph: {
      type,
      url,
      title: socialTitle,
      description,
      siteName: site.name,
      locale: "en_CA",
      ...images,
      ...(type === "article" ? { publishedTime, modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      ...images,
    },
  };
}
