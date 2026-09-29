import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { campaignRedirects } from "./src/config/campaigns";
import { deployEnv, isIndexable } from "./src/lib/env";
import { launchFindings, placeholderWarnings } from "./src/lib/launch";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const list = (items: string[]) => items.map((i) => `   - ${i}`).join("\n");

/**
 * Runs once per build: lists everything still unconfirmed, and applies the
 * launch guard (spec 4.10). A production build for the real domain fails
 * unless leads have a durable home and Kane gets an alert.
 */
function buildChecks() {
  const warnings = placeholderWarnings();
  if (warnings.length) console.warn(`\n⚠️  Still to confirm (src/config/site.ts):\n${list(warnings)}\n`);

  const findings = launchFindings();
  if (!findings.length) return;
  if (deployEnv() === "production" && isIndexable()) {
    throw new Error(`Launch guard: this production build is for the live domain, but it isn't ready to take leads:\n${list(findings)}\n`);
  }
  console.warn(`\n⚠️  Launch guard (a warning on this build; it fails a production build on the real domain):\n${list(findings)}\n`);
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Markdown content is read from disk; make sure it ships with any server-rendered route.
  outputFileTracingIncludes: {
    "/*": ["./content/**/*"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Common URL variants sellers (and old links) might use.
    return [
      { source: "/sell-my-house-fast", destination: "/get-cash-offer", permanent: true },
      { source: "/cash-offer", destination: "/get-cash-offer", permanent: true },
      { source: "/areas", destination: "/we-buy-houses", permanent: true },
      { source: "/locations", destination: "/we-buy-houses", permanent: true },
      // Letter and door-hanger short links (src/config/campaigns.ts).
      ...campaignRedirects(),
    ];
  },
};

export default function config(phase: string): NextConfig {
  // `next typegen` (npm run typecheck) loads the config in the build phase too; only `next build` needs the checks.
  if (phase === PHASE_PRODUCTION_BUILD && !process.argv.includes("typegen")) buildChecks();
  return nextConfig;
}
