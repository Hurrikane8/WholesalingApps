import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Keep preview deployments, and any deployment before a real domain is set
  // (NEXT_PUBLIC_SITE_URL), out of search results. Otherwise Google could index
  // a temporary *.vercel.app address instead of your domain.
  const isPreview = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production";
  const noDomainYet = site.url.includes("example.com");
  if (isPreview || noDomainYet) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/thank-you"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
