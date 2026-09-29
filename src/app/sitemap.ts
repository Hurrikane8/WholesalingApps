import type { MetadataRoute } from "next";
import { locations } from "@/content/locations";
import { getPosts, getSituations } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

/** Every indexable page. New pages must be added here (the SEO audit checks this). Drafts never go in. */
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly" = "monthly") => ({
    url: absoluteUrl(path),
    changeFrequency,
    priority,
  });

  return [
    page("/", 1, "weekly"),
    page("/get-cash-offer", 0.9),
    page("/how-it-works", 0.8),
    page("/what-we-buy", 0.8),
    page("/we-buy-houses", 0.9, "weekly"),
    ...locations.map((l) => page(`/we-buy-houses/${l.slug}`, 0.9)),
    page("/situations", 0.8),
    ...getSituations()
      .filter((s) => !s.draft)
      .map((s) => page(`/situations/${s.slug}`, 0.8)),
    page("/cash-offer-vs-realtor", 0.8),
    page("/blog", 0.7, "weekly"),
    ...getPosts()
      .filter((p) => !p.draft)
      .map((p) => ({
        url: absoluteUrl(`/blog/${p.slug}`),
        lastModified: p.updated ?? p.date,
        changeFrequency: "yearly" as const,
        priority: 0.6,
      })),
    page("/faq", 0.7),
    page("/investors", 0.6),
    page("/about", 0.6),
    page("/contact", 0.6),
    page("/privacy", 0.2, "yearly"),
    page("/terms", 0.2, "yearly"),
  ];
}
