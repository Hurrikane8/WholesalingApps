#!/usr/bin/env node
/**
 * Writes a printable QR code for every campaign in src/config/campaigns.ts
 * (spec 4.8): public/qr/{code}.svg, encoding {site}/go/{code}, error
 * correction M, a four-module quiet zone.
 *
 * Printed codes must never point at a temporary address, so this refuses to
 * run unless NEXT_PUBLIC_SITE_URL is the real https domain:
 *
 *   NEXT_PUBLIC_SITE_URL=https://www.yourdomain.ca npm run qr
 *
 * Needs Node 22.6 or newer (it reads the TypeScript config directly).
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import QRCode from "qrcode";

// Same rules as isFinalDomain() in src/lib/env.ts (tests/campaigns.test.ts keeps them in step).
const TEMPORARY_HOSTS = [".vercel.app", ".netlify.app", ".pages.dev", ".onrender.com"];
const PLACEHOLDER_HOSTS = ["example.com", "localhost", "127.0.0.1"];

/** True only for an https URL on a real, final domain. */
export function isPrintableSiteUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  const host = parsed.hostname.toLowerCase();
  if (TEMPORARY_HOSTS.some((suffix) => host.endsWith(suffix))) return false;
  if (PLACEHOLDER_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return false;
  return true;
}

/** The SVG for one short link. */
export function qrSvg(url) {
  return QRCode.toString(url, { type: "svg", errorCorrectionLevel: "M", margin: 4, color: { dark: "#183A31", light: "#FFFFFF" } });
}

async function main() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/+$/, "");
  if (!isPrintableSiteUrl(siteUrl)) {
    console.error(
      `npm run qr: NEXT_PUBLIC_SITE_URL is "${siteUrl || "(not set)"}". Set it to the real https domain first, e.g.\n  NEXT_PUBLIC_SITE_URL=https://www.yourdomain.ca npm run qr\nPrinted codes must never point at a temporary address.`,
    );
    process.exit(1);
  }

  let mod;
  try {
    mod = await import(pathToFileURL(path.join(process.cwd(), "src/config/campaigns.ts")).href);
  } catch (error) {
    console.error("npm run qr: couldn't read src/config/campaigns.ts (Node 22.6 or newer is needed).", error);
    process.exit(1);
  }
  const { campaigns, campaignProblems } = mod;
  const problems = campaignProblems(campaigns);
  if (problems.length) {
    console.error(`npm run qr: fix src/config/campaigns.ts first:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
    process.exit(1);
  }
  if (campaigns.length === 0) {
    console.log("npm run qr: no campaigns yet. Add one to src/config/campaigns.ts.");
    return;
  }

  const outDir = path.join(process.cwd(), "public", "qr");
  fs.mkdirSync(outDir, { recursive: true });
  for (const c of campaigns) {
    const url = `${siteUrl}/go/${c.code}`;
    fs.writeFileSync(path.join(outDir, `${c.code}.svg`), await qrSvg(url));
    console.log(`public/qr/${c.code}.svg → ${url}  (${c.label})`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
