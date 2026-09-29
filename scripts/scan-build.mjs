#!/usr/bin/env node
/**
 * Scans the prerendered output of `next build` (spec 11.3) and fails, printing
 * the file and a snippet, on:
 *
 *   - banned phrases and patterns (tests/banned-phrases.mjs, spec 2.3);
 *   - `example.com`;
 *   - a page without the wholesaling disclosure (site.disclosure) in its
 *     footer, or /terms, /faq, /about and /how-it-works without it in the page
 *     body as well (spec 9);
 *   - in a production build: an "Unconfirmed" or "Draft" tag, or promise text
 *     whose flag in site.verified is off ("24 hours", "close in 7 days",
 *     "I pay your standard legal fees"…).
 *
 * A preview build (`npm run build:preview`) marks <html data-preview>, and may
 * show unconfirmed claims and drafts with their tags; everything else applies.
 *
 * Usage: npm run build && npm run scan:build
 */
import fs from "node:fs";
import path from "node:path";
import { findBanned, findUnverifiedPromises } from "../tests/banned-phrases.mjs";
import { readDisclosure, readVerifiedFlags } from "./lib/verified-flags.mjs";

const APP_DIR = path.join(process.cwd(), ".next", "server", "app");

if (!fs.existsSync(path.join(APP_DIR, "index.html"))) {
  console.error("No prerendered pages found in .next/server/app. Run `npm run build` first.");
  process.exit(1);
}

/** Prerendered pages (.html) and text route output (.body: robots.txt, sitemap.xml, llms.txt…; not the PNG cards). */
function* outputFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* outputFiles(full);
    else if (/\.(html|body)$/.test(entry.name)) yield full;
  }
}

const INLINE_TAGS = "a|abbr|b|bdi|code|em|i|mark|q|s|small|span|strong|sub|sup|time|u";

/**
 * Visible-ish text: inline tags vanish so "close in <strong>7 days</strong>"
 * still reads as one phrase; block tags become "¦", which the promise
 * patterns treat as a boundary. Script contents (JSON-LD, the RSC payload)
 * stay in, since they're published too.
 */
function toText(html) {
  return html
    .replace(new RegExp(`</?(?:${INLINE_TAGS})(?:\\s[^>]*)?>`, "gi"), "")
    .replace(/<[^>]*>/g, " ¦ ")
    .replace(/\s+/g, " ");
}

const isPreview = /<html\b[^>]*\sdata-preview\b/.test(fs.readFileSync(path.join(APP_DIR, "index.html"), "utf8"));
const verified = readVerifiedFlags();
const disclosure = readDisclosure().replace(/\s+/g, " ").trim();

/** Pages that must show the disclosure in the body too, on top of the footer (spec 9). */
const DISCLOSURE_PAGES = new Set(["terms.html", "faq.html", "about.html", "how-it-works.html"]);
/** Framework error shells without the site chrome. */
const NO_CHROME = new Set(["_global-error.html"]);

/** How many times the disclosure is on the rendered page (scripts, such as the RSC payload, left out). */
function disclosureCount(html) {
  const visible = toText(html.replace(/<script\b[\s\S]*?<\/script>/gi, "")).replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");
  return visible.split(disclosure).length - 1;
}

/** @type {{ file: string, rule: string, snippet: string }[]} */
const problems = [];
let scanned = 0;

for (const file of outputFiles(APP_DIR)) {
  const buffer = fs.readFileSync(file);
  if (buffer.includes(0)) continue; // binary: an Open Graph PNG
  scanned++;
  const raw = buffer.toString("utf8");
  const rel = path.relative(process.cwd(), file);
  const text = file.endsWith(".html") ? toText(raw) : raw;
  const seen = new Set();
  const report = (rule, snippet) => {
    const key = `${rule}|${snippet}`;
    if (seen.has(key)) return;
    seen.add(key);
    problems.push({ file: rel, rule, snippet });
  };

  for (const hit of findBanned(text)) report(`banned ${hit.rule}`, hit.snippet);

  for (const m of raw.matchAll(/example\.com/gi)) {
    report("example.com", raw.slice(Math.max(0, m.index - 60), m.index + 40).replace(/\s+/g, " "));
  }

  if (file.endsWith(".html")) {
    const name = path.relative(APP_DIR, file);
    // In production /styleguide is a 404: its prerendered file is an empty shell, and visitors get the 404 page, which has the footer.
    const skip = NO_CHROME.has(name) || (!isPreview && name === "styleguide.html");
    const needed = DISCLOSURE_PAGES.has(name) ? 2 : skip ? 0 : 1;
    const found = disclosureCount(raw);
    if (found < needed) {
      report("disclosure missing", needed === 2 ? `expected in the page body and the footer, found ${found}` : "expected in the footer");
    }
  }

  if (!isPreview) {
    for (const m of raw.matchAll(/data-(unconfirmed|draft)\b/g)) {
      report(`"${m[1] === "draft" ? "Draft" : "Unconfirmed"}" tag in a production build`, raw.slice(Math.max(0, m.index - 80), m.index + 60).replace(/\s+/g, " "));
    }
    for (const hit of findUnverifiedPromises(text, verified)) report(`unverified promise (${hit.rule})`, hit.snippet);
  }
}

const mode = isPreview ? "preview build: unconfirmed claims and drafts allowed" : "production build";
if (problems.length === 0) {
  console.log(`scan:build: ${scanned} files clean (${mode}).`);
  process.exit(0);
}

console.error(`scan:build: ${problems.length} problem(s) in ${scanned} files (${mode}):\n`);
for (const p of problems) console.error(`  ${p.file}\n    ${p.rule}\n    …${p.snippet.trim()}…\n`);
process.exit(1);
