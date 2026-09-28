import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { isVerified } from "@/lib/claims";
import { markElements } from "@/components/brand/mark-shapes";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * The built-in OG font covers basic Latin only; anything else triggers a
 * network font download at build time. Map common punctuation to ASCII.
 */
function ascii(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/·/g, "|")
    .replace(/…/g, "...")
    .replace(/[^\x20-\x7E]/g, "");
}

/** Branded 1200×630 social card used by every opengraph-image route. */
export function renderOgImage({ eyebrow, title }: { eyebrow: string; title: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #0f2842 0%, #1a4570 60%, #20568a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 64 64">
            {markElements({ gradientId: "ribbon", ink: "#F4F7F8" })}
          </svg>
          <div style={{ fontSize: 34, fontWeight: 700 }}>{ascii(site.name)}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 28, color: "#fcd34d", fontWeight: 600, textTransform: "uppercase", letterSpacing: 2 }}>
            {ascii(eyebrow)}
          </div>
          <div style={{ fontSize: title.length > 48 ? 58 : 70, fontWeight: 800, lineHeight: 1.1, marginTop: 16, maxWidth: 1000 }}>{ascii(title)}</div>
        </div>
        <div style={{ display: "flex", gap: 36, fontSize: 28, color: "#d6e6f4" }}>
          {/* Cards are shared beyond the site, so they carry confirmed claims only, even in preview builds. */}
          {["Sell as-is", "No agent commission", ...(isVerified("explainsOfferMath") ? ["See the math first"] : [])].map((t) => (
            <span key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="26" height="26" viewBox="0 0 24 24">
                <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t}
            </span>
          ))}
          <span style={{ marginLeft: "auto", color: "white", fontWeight: 700 }}>{site.phone}</span>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
