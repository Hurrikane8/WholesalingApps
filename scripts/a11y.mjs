#!/usr/bin/env node
/**
 * Accessibility check of every page (WCAG 2.1 A/AA via axe) at phone and
 * desktop sizes, plus two checks axe doesn't make:
 *   - fails if any visible text renders below 14px;
 *   - warns about touch targets smaller than 44×44px at 390px wide.
 *
 *   npm run build && npm start        # in one terminal
 *   npm run a11y                      # in another (BASE_URL=… to target another host)
 *
 * Exits with code 1 on any serious or critical axe violation or undersized text.
 */
import { AxeBuilder } from "@axe-core/playwright";
import { chromium } from "playwright";
import { BASE_URL, VIEWPORTS, flag, getRoutes, launchOptions } from "./lib/routes.mjs";

const MIN_TEXT_PX = 14;
const MIN_TARGET_PX = 44;
const only = flag("only")?.split(",").filter(Boolean);

const routes = await getRoutes({ only });
const browser = await chromium.launch(launchOptions());
const failures = [];
const warnings = [];

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: "reduce" });
  const page = await context.newPage();
  for (const route of routes) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const where = `${route} @ ${vp.name}`;

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    for (const v of results.violations) {
      const line = `${where}: [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node${v.nodes.length === 1 ? "" : "s"}, e.g. ${v.nodes[0]?.target?.join(" ")})`;
      if (v.impact === "serious" || v.impact === "critical") failures.push(line);
      else warnings.push(line);
    }

    const small = await page.evaluate((min) => {
      const found = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.textContent?.trim();
        const el = node.parentElement;
        if (!text || !el) continue;
        const style = getComputedStyle(el);
        if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) continue;
        const rect = el.getBoundingClientRect();
        // Skip visually hidden text (sr-only, off-screen honeypots) and collapsed content.
        if (rect.width <= 1 || rect.height <= 1 || rect.right < 0 || rect.bottom < 0) continue;
        if (style.clip === "rect(0px, 0px, 0px, 0px)" || style.clipPath === "inset(50%)") continue;
        if (el.closest("details:not([open]) > :not(summary)")) continue;
        const size = parseFloat(style.fontSize);
        if (size < min) found.push(`${size}px "${text.slice(0, 40)}"`);
      }
      return [...new Set(found)];
    }, MIN_TEXT_PX);
    if (small.length) failures.push(`${where}: text below ${MIN_TEXT_PX}px: ${small.slice(0, 5).join("; ")}${small.length > 5 ? ` (+${small.length - 5} more)` : ""}`);

    if (vp.width === 390) {
      const tiny = await page.evaluate((min) => {
        const found = [];
        for (const el of document.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button]")) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0 || rect.right < 0) continue;
          // Links inside running text are exempt (WCAG 2.5.8 inline exception).
          if (el.tagName === "A" && el.closest("p, li") && el.closest("p, li").textContent.trim().length > el.textContent.trim().length + 10) continue;
          // A checkbox or radio counts with its label.
          const target = (el.type === "checkbox" || el.type === "radio") && el.closest("label") ? el.closest("label").getBoundingClientRect() : rect;
          if (target.width < min || target.height < min) {
            found.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || el.name || "").trim().slice(0, 30)}" ${Math.round(target.width)}×${Math.round(target.height)}`);
          }
        }
        return [...new Set(found)];
      }, MIN_TARGET_PX);
      if (tiny.length) warnings.push(`${where}: ${tiny.length} touch target(s) under ${MIN_TARGET_PX}px, e.g. ${tiny.slice(0, 3).join("; ")}`);
    }
  }
  await context.close();
}
await browser.close();

console.log(`\nAccessibility check of ${BASE_URL}: ${routes.length} routes × ${VIEWPORTS.length} viewports\n`);
if (warnings.length) console.log(`⚠️  ${warnings.length} warning(s):\n${warnings.map((w) => `   - ${w}`).join("\n")}\n`);
if (failures.length) {
  console.log(`❌ ${failures.length} failure(s):\n${failures.map((f) => `   - ${f}`).join("\n")}\n`);
  process.exit(1);
}
console.log("✅ No serious or critical violations, and no text below 14px.\n");
