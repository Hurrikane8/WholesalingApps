import type { MetadataRoute } from "next";
import { isIndexable } from "@/lib/env";
import { absoluteUrl } from "@/lib/seo";

/** Pages that exist but should never be crawled. */
export const DISALLOWED_PATHS = ["/api/", "/thank-you", "/hello", "/go/", "/styleguide"];

export default function robots(): MetadataRoute.Robots {
  // Until the site is live on its real domain, keep every crawler out (spec 7.1).
  if (!isIndexable()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: DISALLOWED_PATHS },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
