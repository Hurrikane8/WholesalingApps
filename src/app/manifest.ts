import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { BRAND } from "@/components/brand/colors";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: `${site.tagline} I buy houses, townhouses, duplexes and condos across ${site.market.region}.`,
    start_url: "/",
    display: "browser",
    background_color: BRAND.snow,
    theme_color: BRAND.snow,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      { src: "/brand/logo.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
