import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { isIndexable } from "@/lib/env";
import { breadcrumbSchema, faqSchema, localBusinessSchema, PERSON_ID, personSchema } from "@/lib/schema";

describe("absoluteUrl", () => {
  it("joins paths onto the site URL", () => {
    expect(absoluteUrl("/")).toBe(site.url);
    expect(absoluteUrl("/faq")).toBe(`${site.url}/faq`);
    expect(absoluteUrl("faq")).toBe(`${site.url}/faq`);
    expect(absoluteUrl("https://other.test/x")).toBe("https://other.test/x");
  });
});

describe("pageMetadata", () => {
  it("sets canonical, Open Graph and Twitter fields", () => {
    const m = pageMetadata({ title: "Hello", description: "World", path: "/hello" });
    expect(m.alternates?.canonical).toBe(`${site.url}/hello`);
    expect(m.openGraph).toMatchObject({ url: `${site.url}/hello`, title: `Hello | ${site.name}` });
    expect(m.twitter).toMatchObject({ card: "summary_large_image" });
    // Tests don't run as a production build on the real domain, so nothing is indexable here.
    expect(isIndexable()).toBe(false);
    expect(m.robots).toEqual({ index: false, follow: false });
  });

  it("drops the brand suffix when the title would be too long", () => {
    const long = "A".repeat(60);
    const m = pageMetadata({ title: long, description: "D", path: "/x" });
    expect(m.title).toEqual({ absolute: long });
    expect(m.openGraph?.title).toBe(long);
  });

  it("uses the site-wide card unless the page has its own opengraph-image file", () => {
    const base = { title: "T", description: "D", path: "/t" };
    expect(JSON.stringify(pageMetadata(base).openGraph)).toContain('"/opengraph-image"');
    // Next appends a hash to the image route of dynamic segments, so pages with their own card leave it to Next.
    const own = pageMetadata({ ...base, ownImage: true });
    expect(own.openGraph).not.toHaveProperty("images");
    expect(own.twitter).not.toHaveProperty("images");
  });

  it("marks noindex pages", () => {
    expect(pageMetadata({ title: "T", description: "D", path: "/t", noindex: true }).robots).toMatchObject({ index: false });
  });
});

describe("structured data", () => {
  it("describes the business", () => {
    const org = localBusinessSchema();
    expect(org["@type"]).toBe("LocalBusiness");
    expect(org.name).toBe(site.name);
    expect(org.telephone).toMatch(/^\+1\d{10}$/);
    // Spec 7.3
    expect(org).not.toHaveProperty("priceRange");
    expect(org.logo).toMatch(/\/brand\/logo\.png$/);
    expect(org.slogan).toBe(site.tagline);
    expect(org.founder).toEqual({ "@id": PERSON_ID });
    expect((org.areaServed as { "@type": string }[]).every((a) => a["@type"] === "City")).toBe(true);
  });

  it("never implies a licence", () => {
    expect(JSON.stringify([localBusinessSchema(), personSchema()])).not.toMatch(/RealEstateAgent|licen[cs]ed/i);
  });

  it("builds breadcrumbs and FAQs", () => {
    const crumbs = breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "FAQ", path: "/faq" },
    ]);
    expect((crumbs.itemListElement as unknown[]).length).toBe(2);
    const faq = faqSchema([{ question: "Q?", answer: "A." }]);
    expect(faq["@type"]).toBe("FAQPage");
  });
});

describe("routes, redirects and the sitemap (spec 11.4)", () => {
  it("redirects the old condo situation to the property type page, permanently", async () => {
    const { default: config } = await import("../next.config");
    const redirects = (await config("phase-test").redirects?.()) ?? [];
    expect(redirects).toContainEqual({ source: "/situations/sell-condo-townhouse", destination: "/what-we-buy/condo-townhouses", permanent: true });
  });

  it("lists the property type hub and published types, and leaves out the private and draft pages", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const paths = sitemap().map((entry) => new URL(entry.url).pathname);
    expect(paths).toContain("/what-we-buy");
    expect(paths).toContain("/what-we-buy/condo-townhouses");
    for (const hidden of ["/hello", "/thank-you", "/styleguide", "/what-we-buy/half-duplexes"]) expect(paths).not.toContain(hidden);
    expect(paths.some((p) => p.startsWith("/go/"))).toBe(false);
  });

  it("dates guides in the sitemap from their frontmatter", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const guide = sitemap().find((entry) => entry.url.endsWith("/blog/selling-a-house-as-is"));
    expect(guide?.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("the disclosure (spec 9)", () => {
  it("is in the FAQ answers and the terms", async () => {
    const { getFaqs } = await import("@/content/faqs");
    expect(getFaqs().some((f) => f.answer.includes(site.disclosure))).toBe(true);
    const fs = await import("node:fs");
    expect(fs.readFileSync("content/legal/terms.md", "utf8")).toContain("{{disclosure}}");
  });
});
