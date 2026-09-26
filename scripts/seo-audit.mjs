#!/usr/bin/env node
/**
 * SEO audit: crawls every URL in the sitemap of a running site and checks the
 * on-page SEO basics. Exits non-zero if anything is broken.
 *
 *   npm run build && npm start          # in one terminal
 *   npm run seo:audit                   # in another (defaults to http://localhost:3000)
 *   BASE_URL=https://www.yoursite.com npm run seo:audit   # audit production
 *
 * Checks per page: HTTP 200, <html lang>, title (present, ≤ 65 chars, unique),
 * meta description (70–160 chars, unique), canonical matches the URL, not
 * noindexed, Open Graph + Twitter tags, exactly one <h1>, valid JSON-LD,
 * images have alt text, and every internal link resolves.
 */

const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const TITLE_MAX = 65;
const DESC_MIN = 70;
const DESC_MAX = 160;

const errors = [];
const warnings = [];
const err = (page, msg) => errors.push(`${page}: ${msg}`);
const warn = (page, msg) => warnings.push(`${page}: ${msg}`);

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

function attrs(tag) {
  const out = {};
  for (const [, k, v] of tag.matchAll(/([\w:-]+)="([^"]*)"/g)) out[k.toLowerCase()] = decode(v);
  return out;
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((m) => attrs(m[0]));
}

async function get(url) {
  const res = await fetch(url, { redirect: "manual" });
  return { status: res.status, location: res.headers.get("location"), text: res.status === 200 ? await res.text() : "" };
}

function localize(url) {
  const u = new URL(url);
  return `${BASE_URL}${u.pathname}`;
}

async function main() {
  const sitemap = await get(`${BASE_URL}/sitemap.xml`);
  if (sitemap.status !== 200) throw new Error(`Could not load ${BASE_URL}/sitemap.xml (HTTP ${sitemap.status}). Is the site running?`);
  const urls = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (urls.length === 0) throw new Error("Sitemap has no URLs");

  const robots = await get(`${BASE_URL}/robots.txt`);
  if (robots.status !== 200) err("/robots.txt", `HTTP ${robots.status}`);
  else if (!/sitemap:/i.test(robots.text)) warn("/robots.txt", "no Sitemap line (expected on production builds)");

  const titles = new Map();
  const descriptions = new Map();
  const links = new Set();
  const images = new Set();

  for (const url of urls) {
    const path = new URL(url).pathname;
    const page = await get(localize(url));
    if (page.status !== 200) {
      err(path, `HTTP ${page.status}${page.location ? ` → ${page.location}` : ""} (sitemap URLs must return 200)`);
      continue;
    }
    const html = page.text;
    const head = html.slice(0, html.indexOf("</head>") + 7);
    const metas = tags(head, "meta");
    const meta = (key) => metas.find((m) => m.name === key || m.property === key)?.content;

    if (!/<html[^>]*\blang="[^"]+"/.test(html)) err(path, "missing <html lang>");

    const titleMatches = [...head.matchAll(/<title>([^<]*)<\/title>/g)];
    const title = titleMatches[0] ? decode(titleMatches[0][1]).trim() : "";
    if (titleMatches.length !== 1) err(path, `expected 1 <title>, found ${titleMatches.length}`);
    if (!title) err(path, "empty title");
    else if (title.length > TITLE_MAX) warn(path, `title is ${title.length} chars (> ${TITLE_MAX}): "${title}"`);
    if (title) titles.set(title, [...(titles.get(title) ?? []), path]);

    const desc = meta("description");
    if (!desc) err(path, "missing meta description");
    else {
      if (desc.length < DESC_MIN || desc.length > DESC_MAX) warn(path, `description is ${desc.length} chars (aim for ${DESC_MIN}–${DESC_MAX})`);
      descriptions.set(desc, [...(descriptions.get(desc) ?? []), path]);
    }

    const canonical = tags(head, "link").find((l) => l.rel === "canonical")?.href;
    if (!canonical) err(path, "missing canonical link");
    else if (new URL(canonical).pathname !== path) err(path, `canonical points elsewhere: ${canonical}`);

    const robotsMeta = meta("robots") ?? "";
    if (/noindex/i.test(robotsMeta)) err(path, "page in sitemap is noindex");

    for (const key of ["og:title", "og:description", "og:url", "og:image", "twitter:card"]) {
      if (!meta(key)) err(path, `missing ${key}`);
    }
    const ogImage = meta("og:image");
    if (ogImage) images.add(ogImage);

    const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
    if (h1s !== 1) err(path, `expected exactly 1 <h1>, found ${h1s}`);

    const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    if (jsonLd.length === 0) warn(path, "no JSON-LD structured data");
    for (const [, raw] of jsonLd) {
      try {
        const data = JSON.parse(raw);
        for (const item of Array.isArray(data) ? data : [data]) {
          if (!item["@context"] || !item["@type"]) err(path, "JSON-LD block missing @context or @type");
        }
      } catch (e) {
        err(path, `invalid JSON-LD: ${e.message}`);
      }
    }
    const faqBlocks = jsonLd.filter(([, raw]) => raw.includes('"FAQPage"')).length;
    if (faqBlocks > 1) err(path, `${faqBlocks} FAQPage blocks (Google allows one per page)`);

    for (const img of tags(html, "img")) {
      if (!("alt" in img)) err(path, `<img src="${img.src}"> has no alt attribute`);
    }

    const body = html.slice(html.indexOf("<body"));
    for (const [, href] of body.matchAll(/<a\b[^>]*\bhref="(\/[^"#?]*)/g)) {
      if (!href.startsWith("/_next")) links.add(href);
    }
  }

  for (const [title, paths] of titles) if (paths.length > 1) err(paths.join(", "), `duplicate title "${title}"`);
  for (const [desc, paths] of descriptions) if (paths.length > 1) err(paths.join(", "), `duplicate description "${desc.slice(0, 60)}…"`);

  const sitemapPaths = new Set(urls.map((u) => new URL(u).pathname));
  for (const href of links) {
    const res = await get(`${BASE_URL}${href}`);
    if (res.status >= 400) err(href, `internal link returns HTTP ${res.status}`);
    else if (res.status >= 300) warn(href, `internal link redirects to ${res.location}; link to the final URL instead`);
    else if (!sitemapPaths.has(href) && !["/thank-you"].includes(href) && !href.startsWith("/api/")) {
      warn(href, "linked page is not in the sitemap");
    }
  }

  for (const image of images) {
    const res = await fetch(localize(image));
    const type = res.headers.get("content-type") ?? "";
    if (res.status !== 200 || !type.startsWith("image/")) err(new URL(image).pathname, `og:image returns HTTP ${res.status} (${type})`);
  }

  const llms = await get(`${BASE_URL}/llms.txt`);
  if (llms.status !== 200) warn("/llms.txt", `HTTP ${llms.status}`);

  console.log(`\nSEO audit of ${BASE_URL}: ${urls.length} pages, ${links.size} internal links, ${images.size} social images checked\n`);
  if (warnings.length) console.log(`⚠️  ${warnings.length} warning(s):\n${warnings.map((w) => `   - ${w}`).join("\n")}\n`);
  if (errors.length) {
    console.log(`❌ ${errors.length} error(s):\n${errors.map((e) => `   - ${e}`).join("\n")}\n`);
    process.exit(1);
  }
  console.log("✅ No errors.\n");
}

main().catch((e) => {
  console.error(`SEO audit failed: ${e.message}`);
  process.exit(1);
});
