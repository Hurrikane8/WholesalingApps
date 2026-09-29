import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { BRAND } from "@/components/brand/colors";
import { markElements } from "@/components/brand/mark-shapes";
import { DETAILS, HORIZON, RIBBON } from "@/components/brand/AuroraRoofline";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Satori can't read WOFF2 or variable fonts, so the cards use the static
 * Fontsource WOFF files (spec 3.3): Overpass 800 for the title, Atkinson
 * Hyperlegible Next 600 for the name and phone.
 */
function font(pkg: string, file: string): Buffer {
  return fs.readFileSync(path.join(process.cwd(), "node_modules", "@fontsource", pkg, "files", file));
}

let fonts: { name: string; data: Buffer; weight: 600 | 800; style: "normal" }[] | undefined;
function ogFonts() {
  fonts ??= [
    { name: "Overpass", data: font("overpass", "overpass-latin-800-normal.woff"), weight: 800, style: "normal" },
    { name: "Atkinson", data: font("atkinson-hyperlegible-next", "atkinson-hyperlegible-next-latin-600-normal.woff"), weight: 600, style: "normal" },
  ];
  return fonts;
}

/** The fonts cover Latin only; anything outside it would trigger a font download at build time. */
function latin(text: string): string {
  return text.replace(/[^\x20-\x7E -ſ–—‘’“”…]/g, "");
}

/**
 * The 1200×630 social card (spec 7.5): snow, the mark and "Aurora Home
 * Buyers, Edmonton" top left, the page title in Overpass 800 (three lines at
 * most), the roofline and ribbon along the bottom, and the phone number.
 * Cards travel beyond the site, so titles passed in must never carry an
 * unverified promise.
 */
export function renderOgImage({ title }: { title: string }) {
  const text = latin(title);
  const fontSize = text.length > 60 ? 52 : text.length > 36 ? 60 : 72;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: BRAND.snow,
          color: BRAND.ink,
          fontFamily: "Atkinson",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, padding: "48px 72px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="60" height="60" viewBox="0 0 64 64">
              {markElements({ gradientId: "og-mark" })}
            </svg>
            <div style={{ fontSize: 30, fontWeight: 600 }}>{latin(`${site.name}, ${site.market.name}`)}</div>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 36,
              maxWidth: 1000,
              fontFamily: "Overpass",
              fontWeight: 800,
              fontSize,
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              // Three lines at most.
              maxHeight: fontSize * 1.05 * 3,
              overflow: "hidden",
            }}
          >
            {text}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "auto", paddingBottom: 12, fontSize: 30, fontWeight: 600, color: BRAND.ink }}>
            {site.phone}
          </div>
        </div>
        {/* The whole drawing (1440×220 scaled to 1200 wide), so the ribbon's rise on the right isn't cropped. */}
        <svg width="1200" height="183" viewBox="0 0 1440 220" style={{ display: "flex" }}>
          <defs>
            <linearGradient id="og-ribbon" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={BRAND.auroraGreen} />
              <stop offset="0.5" stopColor={BRAND.auroraTeal} />
              <stop offset="1" stopColor={BRAND.auroraViolet} />
            </linearGradient>
          </defs>
          <path d={RIBBON} fill="none" stroke="url(#og-ribbon)" strokeWidth={18} strokeLinecap="round" opacity={0.14} />
          <path d={RIBBON} fill="none" stroke="url(#og-ribbon)" strokeWidth={6} strokeLinecap="round" opacity={0.85} />
          <path d={HORIZON} fill="none" stroke={BRAND.ink} strokeWidth={2.4} strokeLinejoin="round" />
          <path d={DETAILS} fill="none" stroke={BRAND.ink} strokeWidth={1.8} />
        </svg>
      </div>
    ),
    { ...OG_SIZE, fonts: ogFonts() },
  );
}
