import { Overpass } from "next/font/google";
import localFont from "next/font/local";

/*
 * Both fonts are self-hosted at build time by next/font (no requests to
 * Google from the browser), preloaded, with fallback metrics that keep the
 * swap from shifting the layout. globals.css maps them to Tailwind's
 * font-display and font-sans.
 */

/** Headlines, buttons, amounts: an open descendant of North American highway-sign lettering. */
export const overpass = Overpass({ subsets: ["latin"], variable: "--font-overpass", display: "swap" });

/**
 * Body text: designed with the Braille Institute for low-vision readers.
 * Loaded from Fontsource rather than next/font/google, because Next.js has no
 * fallback metrics for this family yet; next/font/local computes them from the file.
 */
export const atkinson = localFont({
  // Upright only: italics are rare here, and synthesized oblique beats preloading a second file.
  src: [{ path: "../../node_modules/@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2", weight: "200 800", style: "normal" }],
  variable: "--font-atkinson",
  display: "swap",
  adjustFontFallback: "Arial",
});
