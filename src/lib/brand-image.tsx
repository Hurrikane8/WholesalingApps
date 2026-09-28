import { ImageResponse } from "next/og";
import { BRAND } from "@/components/brand/colors";
import { markElements } from "@/components/brand/mark-shapes";

/**
 * The mark on snow as a PNG (next/og), for the Apple touch icon and the logo
 * in structured data. `inset` is the padding around the mark, as a share of the size.
 */
export function markPng(size: number, { inset = 0.16 } = {}) {
  const markSize = Math.round(size * (1 - 2 * inset));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: BRAND.snow }}>
        <svg width={markSize} height={markSize} viewBox="0 0 64 64">
          {markElements({ gradientId: "ribbon", roofWidth: 7.6, ribbonWidth: 6 })}
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
