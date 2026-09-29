import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { locations } from "@/content/locations";
import { getFaqs } from "@/content/faqs";
import { getPosts, getPropertyTypes, getSituations, renderMarkdown } from "@/lib/content";
import { PROPERTY_TYPES, REASONS } from "@/lib/lead-options";
import { site } from "@/config/site";
import { absoluteUrl } from "@/lib/seo";

// Google shows ~65 title characters and ~160 description characters.
const MAX_TITLE = 65;
const MAX_DESCRIPTION = 160;
const MIN_DESCRIPTION = 110;
const situations = getSituations();
const posts = getPosts();
const propertyTypes = getPropertyTypes();
const words = (text: string) => text.split(/\s+/).filter(Boolean).length;

const staticRoutes = [
  "/",
  "/get-cash-offer",
  "/how-it-works",
  "/what-we-buy",
  "/we-buy-houses",
  "/situations",
  "/cash-offer-vs-realtor",
  "/blog",
  "/faq",
  "/about",
  "/contact",
  "/investors",
  "/privacy",
  "/terms",
];
const knownRoutes = new Set([
  ...staticRoutes,
  ...locations.map((l) => `/we-buy-houses/${l.slug}`),
  ...situations.map((s) => `/situations/${s.slug}`),
  ...posts.map((p) => `/blog/${p.slug}`),
  ...propertyTypes.map((t) => `/what-we-buy/${t.slug}`),
]);

function internalLinks(html: string): string[] {
  return [...html.matchAll(/href="(\/[^"#?]*)/g)].map((m) => m[1]);
}

describe("situations", () => {
  it("has content", () => expect(situations.length).toBeGreaterThanOrEqual(5));

  it.each(situations.map((s) => [s.slug, s]))("%s has SEO-sized metadata and valid fields", (_, s) => {
    expect(s.title.length).toBeLessThanOrEqual(MAX_TITLE);
    expect(s.description.length).toBeGreaterThanOrEqual(MIN_DESCRIPTION);
    expect(s.description.length).toBeLessThanOrEqual(MAX_DESCRIPTION);
    expect(s.reason && REASONS.includes(s.reason)).toBeTruthy();
    expect(s.faqs.length).toBeGreaterThan(0);
    expect(s.question.endsWith("?")).toBe(true);
    expect(words(s.answer)).toBeGreaterThanOrEqual(40);
    expect(words(s.answer)).toBeLessThanOrEqual(60);
    expect(s.guides.length).toBeGreaterThan(0);
    for (const slug of s.guides) expect(posts.some((p) => p.slug === slug), `guide ${slug}`).toBe(true);
  });

  it("has the ten situations in the brief (the condo page moved to the property types)", () => {
    expect(situations.filter((s) => !s.draft)).toHaveLength(10);
    expect(situations.some((s) => s.slug === "sell-condo-townhouse")).toBe(false);
  });

  it("has unique titles, descriptions and H1s", () => {
    for (const key of ["title", "description", "h1"] as const) {
      expect(new Set(situations.map((s) => s[key])).size).toBe(situations.length);
    }
  });
});

describe("property types (spec 5.7)", () => {
  it("has the condo townhouse flagship, published and featured", () => {
    const flagship = propertyTypes.find((t) => t.slug === "condo-townhouses");
    expect(flagship?.featured).toBe(true);
    expect(flagship?.draft).toBe(false);
  });

  it("keeps the half duplex page a draft until Kane confirms it", () => {
    expect(propertyTypes.find((t) => t.slug === "half-duplexes")?.draft).toBe(true);
  });

  it.each(propertyTypes.map((t) => [t.slug, t]))("%s has valid fields", (_, t) => {
    expect(PROPERTY_TYPES.map((p) => p.value)).toContain(t.leadValue);
    expect(t.title.length).toBeLessThanOrEqual(MAX_TITLE);
    expect(t.description.length).toBeGreaterThanOrEqual(MIN_DESCRIPTION);
    expect(t.description.length).toBeLessThanOrEqual(MAX_DESCRIPTION);
    expect(words(t.answer)).toBeGreaterThanOrEqual(40);
    expect(words(t.answer)).toBeLessThanOrEqual(60);
    expect(t.question.endsWith("?")).toBe(true);
    expect(t.faqs.length).toBeGreaterThanOrEqual(3);
    for (const slug of t.related) expect(situations.some((s) => s.slug === slug), `related ${slug}`).toBe(true);
  });

  it("has one page per type and unique titles, descriptions and H1s", () => {
    expect(new Set(propertyTypes.map((t) => t.leadValue)).size).toBe(propertyTypes.length);
    for (const key of ["title", "description", "h1"] as const) {
      expect(new Set(propertyTypes.map((t) => t[key])).size).toBe(propertyTypes.length);
    }
  });

  it("only has pages for types the config shows", () => {
    const shown = site.propertyTypes.filter((t) => t.show).map((t) => t.value as string);
    for (const t of propertyTypes) expect(shown, t.slug).toContain(t.leadValue);
  });
});

describe("blog posts", () => {
  it("has content", () => expect(posts.length).toBeGreaterThanOrEqual(3));

  it.each(posts.map((p) => [p.slug, p]))("%s has SEO-sized metadata", (_, p) => {
    expect(p.title.length).toBeLessThanOrEqual(MAX_TITLE);
    expect(p.description.length).toBeGreaterThanOrEqual(MIN_DESCRIPTION);
    expect(p.description.length).toBeLessThanOrEqual(MAX_DESCRIPTION);
    expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Dates come from the file's first commit (spec 6.5), so none can be in the future.
    const today = new Date().toISOString().slice(0, 10);
    expect(p.date <= today, `date ${p.date}`).toBe(true);
    if (p.updated) {
      expect(p.updated <= today, `updated ${p.updated}`).toBe(true);
      expect(p.updated >= p.date).toBe(true);
    }
    expect(Boolean(p.question) === Boolean(p.answer), "question and answer go together").toBe(true);
    if (p.answer) {
      expect(words(p.answer)).toBeGreaterThanOrEqual(40);
      expect(words(p.answer)).toBeLessThanOrEqual(60);
    }
  });
});

describe("locations", () => {
  it("has unique slugs in city-state format", () => {
    expect(new Set(locations.map((l) => l.slug)).size).toBe(locations.length);
    for (const l of locations) expect(l.slug).toMatch(/^[a-z0-9-]+-[a-z]{2}$/);
  });

  it("only links to nearby areas that exist", () => {
    const slugs = new Set(locations.map((l) => l.slug));
    for (const l of locations) {
      for (const n of l.nearby) {
        expect(slugs.has(n), `${l.slug} → ${n}`).toBe(true);
        expect(n).not.toBe(l.slug);
      }
    }
  });

  it("has unique local copy for every city (no duplicate doorway pages)", () => {
    expect(new Set(locations.map((l) => l.intro)).size).toBe(locations.length);
    const details = locations.flatMap((l) => l.localDetails);
    expect(new Set(details).size).toBe(details.length);
  });
});

describe("markdown content", () => {
  const docs = [
    ...situations.map((s) => [`situations/${s.slug}`, s.body] as const),
    ...propertyTypes.map((t) => [`property-types/${t.slug}`, t.body] as const),
    ...posts.map((p) => [`blog/${p.slug}`, p.body] as const),
    ...["legal/privacy", "legal/terms"].map(
      (n) => [n, fs.readFileSync(path.join(process.cwd(), "content", `${n}.md`), "utf8")] as const,
    ),
  ];

  it.each(docs)("%s has no unfilled placeholders and no broken internal links", (_, body) => {
    const { html } = renderMarkdown(body);
    expect(html).not.toMatch(/\{\{\s*\w+\s*\}\}/);
    expect(html).not.toContain("<!--");
    for (const link of internalLinks(html)) expect(knownRoutes.has(link), `broken link ${link}`).toBe(true);
  });

  it("gives h2 headings ids", () => {
    const { html, headings } = renderMarkdown("## Hello World\n\ntext");
    expect(html).toContain('<h2 id="hello-world">');
    expect(headings).toEqual([{ id: "hello-world", text: "Hello World" }]);
  });
});

describe("internal links (spec 7.7)", () => {
  const published = <T extends { draft: boolean }>(items: T[]) => items.filter((i) => !i.draft);
  const draftRoutes = new Set([
    ...situations.filter((s) => s.draft).map((s) => `/situations/${s.slug}`),
    ...posts.filter((p) => p.draft).map((p) => `/blog/${p.slug}`),
    ...propertyTypes.filter((t) => t.draft).map((t) => `/what-we-buy/${t.slug}`),
  ]);
  const publishedGuide = (slug: string) => posts.some((p) => p.slug === slug && !p.draft);

  it.each(published(propertyTypes).map((t) => [t.slug, t]))("property type %s links two situations and a published guide", (_, t) => {
    expect(t.related.length).toBeGreaterThanOrEqual(2);
    expect(t.guides.some(publishedGuide)).toBe(true);
  });

  it.each(published(situations).map((s) => [s.slug, s]))("situation %s links a published guide", (_, s) => {
    expect(s.guides.some(publishedGuide)).toBe(true);
  });

  it.each(published(posts).map((p) => [p.slug, p]))("guide %s links the calculator and a situation or property type", (_, p) => {
    const links = internalLinks(renderMarkdown(p.body).html);
    expect(links).toContain("/cash-offer-vs-realtor");
    expect(links.some((l) => l.startsWith("/situations/") || l.startsWith("/what-we-buy/"))).toBe(true);
  });

  it("never links a published page to a draft", () => {
    const docs = [...published(situations), ...published(posts), ...published(propertyTypes)];
    for (const doc of docs) {
      for (const link of internalLinks(renderMarkdown(doc.body).html)) expect(draftRoutes.has(link), `${doc.slug} → ${link}`).toBe(false);
    }
  });
});

describe("faqs", () => {
  const faqs = getFaqs();
  it("has unique questions", () => expect(new Set(faqs.map((f) => f.question)).size).toBe(faqs.length));
});

describe("drafts", () => {
  it("stay out of the sitemap", async () => {
    // Vitest isn't a production build, so drafts load here, as in a preview build.
    const { default: sitemap } = await import("@/app/sitemap");
    const urls = new Set(sitemap().map((entry) => entry.url));
    const pages = [
      ...situations.map((s) => ({ draft: s.draft, path: `/situations/${s.slug}` })),
      ...posts.map((p) => ({ draft: p.draft, path: `/blog/${p.slug}` })),
      ...propertyTypes.map((t) => ({ draft: t.draft, path: `/what-we-buy/${t.slug}` })),
    ];
    for (const page of pages) expect(urls.has(absoluteUrl(page.path)), page.path).toBe(!page.draft);
  });
});
