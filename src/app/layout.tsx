import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { site } from "@/config/site";
import { localBusinessSchema, websiteSchema } from "@/lib/schema";
import { Analytics } from "@/components/Analytics";
import { JsonLd } from "@/components/JsonLd";
import { MobileCtaBar } from "@/components/MobileCtaBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const defaultTitle = `Sell Your House Fast for Cash in ${site.market.name}, ${site.market.stateAbbr}`;
const defaultDescription = `Sell your ${site.market.region} house fast for a fair cash offer. No repairs, no commissions, no fees. Close in as little as ${site.promises.closeInDays} days or on your schedule.`;

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
    locale: "en_US",
    title: `${defaultTitle} | ${site.name}`,
    description: defaultDescription,
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: true },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f2842",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-US">
      <body className="flex min-h-screen flex-col">
        <JsonLd data={[localBusinessSchema(), websiteSchema()]} />
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <MobileCtaBar />
        <Analytics />
      </body>
    </html>
  );
}
