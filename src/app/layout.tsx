import type { Metadata, Viewport } from "next";
import "./globals.css";
import { atkinson, overpass } from "./fonts";
import { site } from "@/config/site";
import { siteDescription } from "@/lib/claims";
import { isIndexable, showDrafts, showUnconfirmed } from "@/lib/env";
import { localBusinessSchema, websiteSchema } from "@/lib/schema";
import { Analytics } from "@/components/Analytics";
import { AttributionCapture } from "@/components/AttributionCapture";
import { JsonLd } from "@/components/JsonLd";

const defaultTitle = `Sell your ${site.market.name} home as-is for cash`;
const defaultDescription = siteDescription();

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${defaultTitle} | ${site.name}`,
    template: `%s | ${site.name}`,
  },
  description: defaultDescription,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_CA",
    title: `${defaultTitle} | ${site.name}`,
    description: defaultDescription,
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
  // Belt and braces with robots.txt: nothing is indexed until the site is live on its real domain.
  robots: isIndexable() ? undefined : { index: false, follow: false },
  formatDetection: { telephone: true },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f7f8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-preview marks non-production builds, so scripts/scan-build.mjs can tell them apart.
    <html
      lang="en-CA"
      className={`${overpass.variable} ${atkinson.variable}`}
      data-preview={showUnconfirmed() || showDrafts() ? "" : undefined}
    >
      <body>
        <JsonLd data={[localBusinessSchema(), websiteSchema()]} />
        {/* The header, footer and sticky actions come from the (site) and (focus) layouts. */}
        {children}
        <AttributionCapture />
        <Analytics />
      </body>
    </html>
  );
}
