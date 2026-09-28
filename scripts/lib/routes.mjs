/**
 * Route discovery shared by the screenshot and accessibility scripts:
 * every URL in the sitemap, plus the pages the sitemap deliberately leaves out.
 */

export const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");

/** Pages that exist but aren't in the sitemap (noindex or non-production). */
const EXTRA_ROUTES = ["/thank-you", "/hello", "/styleguide"];

/** A path that should 404, so the not-found page gets checked too. */
export const MISSING_ROUTE = "/this-page-does-not-exist";

export async function getRoutes({ only } = {}) {
  const res = await fetch(`${BASE_URL}/sitemap.xml`);
  if (!res.ok) throw new Error(`Could not load ${BASE_URL}/sitemap.xml (HTTP ${res.status}). Is the site running?`);
  const xml = await res.text();
  const fromSitemap = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1].trim()).pathname);

  const extras = [];
  for (const route of EXTRA_ROUTES) {
    const r = await fetch(`${BASE_URL}${route}`, { redirect: "manual" });
    if (r.status === 200) extras.push(route);
  }

  let routes = [...new Set([...fromSitemap, ...extras, MISSING_ROUTE])];
  if (only?.length) routes = routes.filter((r) => only.some((o) => r === o || (o.endsWith("*") && r.startsWith(o.slice(0, -1)))));
  return routes;
}

/** "/" → "home", "/we-buy-houses/edmonton-ab" → "we-buy-houses__edmonton-ab". */
export function routeSlug(route) {
  if (route === MISSING_ROUTE) return "404";
  return route.replace(/^\//, "").replace(/\/$/, "").replace(/\//g, "__") || "home";
}

/** Parses "--name=value" flags. */
export function flag(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((a) => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

export const VIEWPORTS = [
  { name: "390x844", width: 390, height: 844 },
  { name: "1440x900", width: 1440, height: 900 },
];

/** Launch options; CHROMIUM_EXECUTABLE_PATH lets you point at an already-installed browser. */
export function launchOptions() {
  return process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {};
}
