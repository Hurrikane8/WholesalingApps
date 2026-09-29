/**
 * Loads Markdown content from /content (property types, seller situations, guides and legal pages).
 *
 * Markdown may use these placeholders, filled in from src/config/site.ts so
 * copy never drifts from the real business details:
 *   {{company}} {{legalName}} {{market}} {{region}} {{province}} {{phone}} {{email}}
 *   {{siteUrl}} {{disclosure}}
 *
 * Promises come only from src/lib/claims.ts, through these placeholders, and
 * say something specific only once Kane has confirmed it:
 *   {{closingPhrase}}      "as soon as 7 days, or on the date you choose" / "on the date you choose"
 *   {{offerTimingPhrase}}  "within 24 hours of seeing the place" / "after I see the place"
 *   {{legalFeesSentence}}  "I pay your standard legal fees." / nothing
 * Write the surrounding sentence so it reads well either way. The old numeric
 * placeholders ({{closeDays}}, {{offerHours}}) are rejected by the tests.
 *
 * Drafts (`draft: true`) render only outside production (showDrafts()), with
 * a Draft banner, and never go in the sitemap.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { Marked } from "marked";
import { site } from "@/config/site";
import { closingPhrase, isUnconfirmed, legalFeesSentence, offerTimingPhrase, type VerifiedFlag } from "@/lib/claims";
import { showDrafts } from "@/lib/env";
import { PROPERTY_TYPES, REASONS, type PropertyTypeValue, type Reason } from "@/lib/lead-options";

const CONTENT_DIR = path.join(process.cwd(), "content");

/** Placeholders removed in v2; content using them fails the tests. */
export const FORBIDDEN_PLACEHOLDERS = ["closeDays", "offerHours"] as const;

/** The "Unconfirmed" tag, inside Markdown HTML, for claims shown only in preview builds. */
export const UNCONFIRMED_TAG_HTML = '<span class="tag-unconfirmed" data-unconfirmed="">Unconfirmed</span>';

type Replacement = { text: string; flag?: VerifiedFlag };

function replacements(): Record<string, Replacement> {
  return {
    company: { text: site.name },
    legalName: { text: site.legalName },
    email: { text: site.email },
    siteUrl: { text: site.url },
    disclosure: { text: site.disclosure },
    market: { text: site.market.name },
    region: { text: site.market.region },
    province: { text: site.market.province },
    phone: { text: site.phone },
    closingPhrase: { text: closingPhrase(), flag: "closeInDays" },
    offerTimingPhrase: { text: offerTimingPhrase(), flag: "offerWithinHours" },
    legalFeesSentence: { text: legalFeesSentence() ?? "", flag: "coversLegalFees" },
  };
}

/**
 * Fills {{placeholders}}. With `html: true` (Markdown bodies), a claim that's
 * shown only because this is a preview build gets an "Unconfirmed" tag.
 */
export function fillPlaceholders(text: string, { html = false }: { html?: boolean } = {}): string {
  const values = replacements();
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => {
    if ((FORBIDDEN_PLACEHOLDERS as readonly string[]).includes(key)) {
      throw new Error(`The {{${key}}} placeholder was removed; use {{closingPhrase}}, {{offerTimingPhrase}} or {{legalFeesSentence}}.`);
    }
    const value = values[key];
    if (!value) return match;
    const tagged = html && value.text && value.flag && isUnconfirmed(value.flag);
    return tagged ? `${value.text} ${UNCONFIRMED_TAG_HTML}` : value.text;
  });
}

/** Plain text from inline HTML: strips tags and decodes the entities marked emits. */
function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function slugify(text: string): string {
  return plainText(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type Heading = { id: string; text: string };

/** Renders Markdown to HTML, giving every h2 an id so it can be linked to. */
export function renderMarkdown(markdown: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const id = slugify(text);
        if (depth === 2) headings.push({ id, text: plainText(text) });
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      },
      table(token) {
        const header = token.header.map((cell) => `<th>${this.parser.parseInline(cell.tokens)}</th>`).join("");
        const rows = token.rows
          .map((row) => `<tr>${row.map((cell) => `<td>${this.parser.parseInline(cell.tokens)}</td>`).join("")}</tr>`)
          .join("");
        // Focusable and labelled, so keyboard users can scroll it if it's ever wider than the screen.
        const label = plainText(token.header.map((cell) => this.parser.parseInline(cell.tokens)).join(", "));
        return `<div class="table-scroll" tabindex="0" role="region" aria-label="Table: ${label.replace(/"/g, "&quot;")}"><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
      },
    },
  });
  // HTML comments are author notes; keep them out of the published page.
  const source = fillPlaceholders(markdown.replace(/<!--[\s\S]*?-->/g, ""), { html: true });
  const html = marked.parse(source, { async: false });
  return { html, headings };
}

type Entry = { slug: string; data: Record<string, unknown>; body: string; draft: boolean };

/** Every Markdown file in a collection; drafts only when showDrafts(). */
function readCollection(collection: string): Entry[] {
  const dir = path.join(CONTENT_DIR, collection);
  if (!fs.existsSync(dir)) return [];
  const drafts = showDrafts();
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      return { slug: file.replace(/\.md$/, ""), data, body: content, draft: data.draft === true };
    })
    .filter((entry) => drafts || !entry.draft);
}

function str(value: unknown, field: string, file: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`content/${file}: frontmatter field "${field}" is required`);
  }
  return fillPlaceholders(value.trim());
}

function isoDate(value: unknown, field: string, file: string): string {
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) throw new Error(`content/${file}: "${field}" must be a date (YYYY-MM-DD)`);
  return date.toISOString().slice(0, 10);
}

/** A single Markdown page, e.g. getMarkdownPage("legal/privacy"). */
export function getMarkdownPage(name: string): { data: Record<string, unknown>; html: string } {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, `${name}.md`), "utf8");
  const { data, content } = matter(raw);
  return { data, html: renderMarkdown(content).html };
}

/* ─── Property types (spec 5.7) ─────────────────────────────────────────── */

export type PropertyType = {
  slug: string;
  /** SEO title, 65 characters or fewer. */
  title: string;
  description: string;
  h1: string;
  /** "Condo townhouses" */
  label: string;
  /** A PROPERTY_TYPES value (an Airtable choice); preselects the form. */
  leadValue: PropertyTypeValue;
  /** One or two sentences, used in lists. */
  summary: string;
  order: number;
  featured: boolean;
  /** The StraightAnswer callout: the question, and a 40–60 word answer. */
  question: string;
  answer: string;
  /** Which sample ledger to show. */
  sample: "house" | "condo";
  /** Situation slugs to link to. */
  related: string[];
  /** Guide slugs to link to under "Related guides" (drafts drop out in production). */
  guides: string[];
  faqs: { question: string; answer: string }[];
  body: string;
  /** Rendered only outside production, with a Draft banner; never in the sitemap. */
  draft: boolean;
};

let propertyTypesCache: PropertyType[] | undefined;

/** content/property-types/*.md, in display order. Drafts only when showDrafts(). */
export function getPropertyTypes(): PropertyType[] {
  if (propertyTypesCache) return propertyTypesCache;
  propertyTypesCache = readCollection("property-types")
    .map(({ slug, data, body, draft }) => {
      const file = `property-types/${slug}.md`;
      const leadValue = PROPERTY_TYPES.find((t) => t.value === data.leadValue)?.value;
      if (!leadValue) throw new Error(`content/${file}: "leadValue" must be one of ${PROPERTY_TYPES.map((t) => t.value).join(", ")}`);
      const faqs = Array.isArray(data.faqs) ? data.faqs : [];
      return {
        slug,
        title: str(data.title, "title", file),
        description: str(data.description, "description", file),
        h1: str(data.h1, "h1", file),
        label: str(data.label, "label", file),
        leadValue,
        summary: str(data.summary, "summary", file),
        order: typeof data.order === "number" ? data.order : 99,
        featured: data.featured === true,
        question: str(data.question, "question", file),
        answer: str(data.answer, "answer", file),
        sample: data.sample === "condo" ? ("condo" as const) : ("house" as const),
        related: Array.isArray(data.related) ? data.related.filter((r): r is string => typeof r === "string") : [],
        guides: Array.isArray(data.guides) ? data.guides.filter((g): g is string => typeof g === "string") : [],
        faqs: faqs.map((f: { q?: unknown; a?: unknown }, i: number) => ({
          question: str(f.q, `faqs[${i}].q`, file),
          answer: str(f.a, `faqs[${i}].a`, file),
        })),
        body,
        draft,
      };
    })
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
  return propertyTypesCache;
}

export function getPropertyType(slug: string): PropertyType | undefined {
  return getPropertyTypes().find((t) => t.slug === slug);
}

/** The page for a property type value (e.g. "Condo townhouse"), if one is published. */
export function propertyTypePage(value: string): PropertyType | undefined {
  return getPropertyTypes().find((t) => t.leadValue === value);
}

/* ─── Seller situations ─────────────────────────────────────────────────── */

export type Situation = {
  slug: string;
  /** SEO title (the brand is appended automatically). */
  title: string;
  description: string;
  h1: string;
  /** Short label for cards and menus. */
  label: string;
  /** One or two sentences for cards. */
  summary: string;
  /** Pre-fills the lead form's "reason for selling"; must match one of REASONS. */
  reason?: Reason;
  order: number;
  /** The StraightAnswer callout (spec 6.4): the question, and a 40–60 word answer. */
  question: string;
  answer: string;
  /** Guide slugs to link to under "Related guides". */
  guides: string[];
  faqs: { question: string; answer: string }[];
  body: string;
  /** Rendered only outside production, with a Draft banner; never in the sitemap. */
  draft: boolean;
};

let situationsCache: Situation[] | undefined;

export function getSituations(): Situation[] {
  if (situationsCache) return situationsCache;
  situationsCache = readCollection("situations")
    .map(({ slug, data, body, draft }) => {
      const file = `situations/${slug}.md`;
      const faqs = Array.isArray(data.faqs) ? data.faqs : [];
      return {
        slug,
        title: str(data.title, "title", file),
        description: str(data.description, "description", file),
        h1: str(data.h1, "h1", file),
        label: str(data.label, "label", file),
        summary: str(data.summary, "summary", file),
        reason: REASONS.find((r) => r === data.reason),
        order: typeof data.order === "number" ? data.order : 99,
        question: str(data.question, "question", file),
        answer: str(data.answer, "answer", file),
        guides: Array.isArray(data.guides) ? data.guides.filter((g): g is string => typeof g === "string") : [],
        faqs: faqs.map((f: { q?: unknown; a?: unknown }, i: number) => ({
          question: str(f.q, `faqs[${i}].q`, file),
          answer: str(f.a, `faqs[${i}].a`, file),
        })),
        body,
        draft,
      };
    })
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
  return situationsCache;
}

export function getSituation(slug: string): Situation | undefined {
  return getSituations().find((s) => s.slug === slug);
}

/* ─── Blog ──────────────────────────────────────────────────────────────── */

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  author?: string;
  category: string;
  /** Optional StraightAnswer callout (spec 6.4): both or neither. */
  question?: string;
  answer?: string;
  readingMinutes: number;
  body: string;
  /** Rendered only outside production, with a Draft banner; never in the sitemap. */
  draft: boolean;
};

let postsCache: Post[] | undefined;

export function getPosts(): Post[] {
  if (postsCache) return postsCache;
  postsCache = readCollection("blog")
    .map(({ slug, data, body, draft }) => {
      const file = `blog/${slug}.md`;
      const words = body.split(/\s+/).filter(Boolean).length;
      return {
        slug,
        title: str(data.title, "title", file),
        description: str(data.description, "description", file),
        date: isoDate(data.date, "date", file),
        updated: data.updated ? isoDate(data.updated, "updated", file) : undefined,
        author: typeof data.author === "string" && data.author ? data.author : undefined,
        category: typeof data.category === "string" ? data.category : "Guides",
        question: data.question ? str(data.question, "question", file) : undefined,
        answer: data.answer ? str(data.answer, "answer", file) : undefined,
        readingMinutes: Math.max(1, Math.round(words / 230)),
        body,
        draft,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
  return postsCache;
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}
