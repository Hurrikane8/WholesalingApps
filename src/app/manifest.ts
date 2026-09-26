import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: `We buy houses for cash in ${site.market.region}.`,
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#0f2842",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
