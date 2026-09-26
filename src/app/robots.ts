import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Keep preview deployments, and the site itself until it has a real domain,
  // out of search results, so Google never indexes a temporary *.vercel.app
  // address instead of your domain.
  const isPreview = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production";
  const host = new URL(site.url).hostname;
  const noDomainYet = host.endsWith("example.com") || host.endsWith(".vercel.app");
  if (isPreview || noDomainYet) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/thank-you"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
