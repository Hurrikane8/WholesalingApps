import type { NextConfig } from "next";
import { placeholderWarnings } from "./src/config/site";

// Remind whoever is building the site to finish src/config/site.ts before launch.
const warnings = placeholderWarnings();
if (warnings.length) {
  console.warn(
    `\n⚠️  Site config still has placeholder values (edit src/config/site.ts):\n${warnings.map((w) => `   - ${w}`).join("\n")}\n`,
  );
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

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
    ];
  },
};

export default nextConfig;
