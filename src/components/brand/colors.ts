/**
 * Brand colours as hex, for places CSS variables can't reach: generated
 * images (next/og) and SVG gradient stops. They mirror the tokens in
 * src/app/globals.css; tests/brand.test.ts keeps the two in step.
 */
export const BRAND = {
  snow: "#F4F7F8",
  frost: "#E3ECEE",
  mist: "#C9D6D9",
  ink: "#183A31",
  ink2: "#3F5A54",
  pine: "#0B6B4F",
  night: "#0E2A30",
  auroraGreen: "#3FE0A0",
  auroraTeal: "#31C6D4",
  auroraViolet: "#8F7CF7",
} as const;
