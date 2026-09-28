#!/usr/bin/env node
/**
 * Design screenshots of every page at phone and desktop sizes.
 *
 *   npm run build && npm start        # in one terminal
 *   npm run screenshots -- --label=before
 *   npm run screenshots -- --label=after --only=/,/get-cash-offer
 *
 * Saves screenshots/{label}/{route}-{viewport}.png (full page) and
 * screenshots/{label}/{route}-{viewport}-fold.png (above the fold), then prints
 * every page's height with warnings for the page-length budgets (spec 5.20).
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { BASE_URL, VIEWPORTS, flag, getRoutes, launchOptions, routeSlug } from "./lib/routes.mjs";

const label = flag("label") || new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const only = flag("only")?.split(",").filter(Boolean);
const outDir = path.join("screenshots", label);

/** Page-length budgets in px (spec 5.20). */
const BUDGETS = {
  "/": { "390x844": 7600, "1440x900": 5600 },
  "/get-cash-offer": { "390x844": 5000 },
};

const routes = await getRoutes({ only });
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch(launchOptions());
const heights = [];
const warnings = [];

for (const vp of VIEWPORTS) {
  // Reduced motion renders the aurora ribbon fully drawn, so screenshots are stable.
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: "reduce" });
  const page = await context.newPage();
  for (const route of routes) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const base = path.join(outDir, `${routeSlug(route)}-${vp.name}`);
    await page.screenshot({ path: `${base}.png`, fullPage: true });
    await page.screenshot({ path: `${base}-fold.png` });
    heights.push({ route, viewport: vp.name, height });
    const budget = BUDGETS[route]?.[vp.name];
    if (budget && height > budget) warnings.push(`${route} at ${vp.name} is ${height}px tall (budget ${budget}px)`);
  }
  await context.close();
}
await browser.close();

console.log(`\nScreenshots saved to ${outDir}/\n`);
console.log("Route".padEnd(52) + VIEWPORTS.map((v) => v.name.padStart(10)).join(""));
for (const route of routes) {
  const row = VIEWPORTS.map((v) => String(heights.find((h) => h.route === route && h.viewport === v.name)?.height ?? "").padStart(10));
  console.log(route.padEnd(52) + row.join(""));
}
if (warnings.length) {
  console.log(`\n⚠️  Page-length budget exceeded:\n${warnings.map((w) => `   - ${w}`).join("\n")}`);
} else {
  console.log("\n✅ All page-length budgets met.");
}
