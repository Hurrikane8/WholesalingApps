import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { isIndexable } from "@/lib/env";
import { breadcrumbSchema, faqSchema, localBusinessSchema } from "@/lib/schema";

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

  it("uses the site-wide social image unless a page provides its own", () => {
    const base = { title: "T", description: "D", path: "/t" };
    expect(JSON.stringify(pageMetadata(base).openGraph)).toContain('"/opengraph-image"');
    const custom = pageMetadata({ ...base, image: { path: "/t/opengraph-image", alt: "T" } });
    expect(JSON.stringify(custom.openGraph)).toContain('"/t/opengraph-image"');
    expect(JSON.stringify(custom.twitter)).toContain('"/t/opengraph-image"');
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
