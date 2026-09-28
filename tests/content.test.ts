import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SITUATION_ICONS } from "@/components/icons";
import { locations } from "@/content/locations";
import { getFaqs } from "@/content/faqs";
import { getPosts, getSituations, renderMarkdown } from "@/lib/content";
import { REASONS } from "@/lib/lead-options";
import { absoluteUrl } from "@/lib/seo";

// Google shows ~65 title characters and ~160 description characters.
const MAX_TITLE = 65;
const MAX_DESCRIPTION = 160;
const MIN_DESCRIPTION = 110;
const situations = getSituations();
const posts = getPosts();

const staticRoutes = [
  "/",
  "/get-cash-offer",
  "/how-it-works",
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
    expect(SITUATION_ICONS).toHaveProperty(s.icon);
    expect(s.reason && REASONS.includes(s.reason)).toBeTruthy();
    expect(s.faqs.length).toBeGreaterThan(0);
  });

  it("has unique titles, descriptions and H1s", () => {
    for (const key of ["title", "description", "h1"] as const) {
      expect(new Set(situations.map((s) => s[key])).size).toBe(situations.length);
    }
  });
});

describe("blog posts", () => {
  it("has content", () => expect(posts.length).toBeGreaterThanOrEqual(3));

  it.each(posts.map((p) => [p.slug, p]))("%s has SEO-sized metadata", (_, p) => {
    expect(p.title.length).toBeLessThanOrEqual(MAX_TITLE);
    expect(p.description.length).toBeGreaterThanOrEqual(MIN_DESCRIPTION);
    expect(p.description.length).toBeLessThanOrEqual(MAX_DESCRIPTION);
    expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
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
    ];
    for (const page of pages) expect(urls.has(absoluteUrl(page.path)), page.path).toBe(!page.draft);
  });
});
