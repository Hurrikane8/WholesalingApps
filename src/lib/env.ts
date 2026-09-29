/**
 * Deploy environment and indexing rules (spec 2.5, 7.1).
 *
 * Every function reads process.env when called, so tests can change it. Call
 * these from server components, route handlers or next.config.ts only, and
 * pass plain values down to client components: VERCEL_ENV and SITE_ENV aren't
 * available in the browser.
 *
 * Imports are relative (no "@/" alias) because next.config.ts loads this file.
 */
import { site } from "../config/site";

export type DeployEnv = "production" | "preview" | "development";

/** VERCEL_ENV on Vercel, SITE_ENV on other hosts, else inferred from NODE_ENV. */
export function deployEnv(): DeployEnv {
  const env = process.env.VERCEL_ENV || process.env.SITE_ENV || (process.env.NODE_ENV === "production" ? "production" : "development");
  return env === "production" || env === "preview" ? env : "development";
}

/** Show gated (unconfirmed) claims with an "Unconfirmed" tag. Never in production. */
export function showUnconfirmed(): boolean {
  return deployEnv() !== "production" && process.env.NEXT_PUBLIC_PREVIEW_UNCONFIRMED === "true";
}

/** Render draft pages and posts (with a "Draft" banner). Never in production. */
export function showDrafts(): boolean {
  return deployEnv() !== "production";
}

const TEMPORARY_HOSTS = [".vercel.app", ".netlify.app", ".pages.dev", ".onrender.com"];
const PLACEHOLDER_HOSTS = ["example.com", "localhost", "127.0.0.1"];

/** False for hosting defaults (*.vercel.app…), placeholders and local addresses. */
export function isFinalDomain(url: string): boolean {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  if (TEMPORARY_HOSTS.some((suffix) => host.endsWith(suffix))) return false;
  if (PLACEHOLDER_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return false;
  return true;
}

/** Search engines may index the site: production, on the real domain, not switched off. */
export function isIndexable(url: string = site.url): boolean {
  return deployEnv() === "production" && isFinalDomain(url) && process.env.SITE_INDEXABLE !== "false";
}
