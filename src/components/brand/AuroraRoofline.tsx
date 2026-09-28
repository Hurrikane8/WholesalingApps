import { useId } from "react";

/**
 * The Aurora Roofline (spec 3.6): one continuous ink line tracing a street of
 * Edmonton home types, with a ribbon of northern light above the rooftops.
 * Pure inline SVG, no JavaScript and no raster images, all in this one file so
 * an illustrator's redraw can replace it later.
 *
 * The drawing lives in a 1440×220 viewBox with the ground at y=218. Below
 * 640px it isn't shrunk: the middle 60% (x 288–1152) is shown instead, so the
 * two-storey, the townhouses, the half duplex and the walk-up stay readable.
 */

const GROUND = 218;

/** Left to right: the one continuous horizon path. */
const HORIZON = [
  `M0 ${GROUND}`,
  // 1. 1950s bungalow: low hip roof and a chimney
  "H48 V186 H38 L96 166 H160 V150 H172 V166 H184 L242 186 H232 V218",
  // 2. Two-storey with a front gable
  "H308 V150 H298 L368 112 L438 150 H428 V218",
  // 3. A row of four 1970s–80s townhouses, stepped roofline
  "H480 V150 L516 140 L552 150 V144 L588 134 L624 144 V138 L660 128 L696 138 V132 L732 122 L768 132 V218",
  // 4. Half duplex: one roof over two homes
  "H823 V158 H813 L890 120 L967 158 H957 V218",
  // 5. Three-storey walk-up: flat roof, stair bulkhead
  "H1014 V114 H1040 V104 H1062 V114 H1136 V218",
  // 6. Bungalow with a detached garage
  "H1198 V184 H1188 L1260 158 L1332 184 H1322 V218",
  "H1352 V192 H1346 L1383 176 L1420 192 H1414 V218",
  "H1440",
].join(" ");

/** Small details at 1.5px: windows on about a third of the homes, entry canopies, the duplex's mirrored doors, a garage door. */
const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y} h${w} v${h} h${-w} Z`;
const DETAILS = [
  // Two-storey windows
  rect(324, 160, 18, 16),
  rect(386, 160, 18, 16),
  rect(324, 188, 18, 16),
  rect(386, 188, 18, 16),
  // Townhouse entries: a small canopy over each door
  ...[0, 1, 2, 3].map((i) => `M${492 + 72 * i} 194 l6 -6 h16 l6 6 M${499 + 72 * i} 218 V200 H${513 + 72 * i} V218`),
  // Half duplex: mirrored doors either side of the party wall
  "M866 218 V190 H878 V218",
  "M902 218 V190 H914 V218",
  // Walk-up windows, three floors
  ...[124, 158, 192].flatMap((y) => [1026, 1052, 1086, 1112].map((x) => rect(x, y, 12, 14))),
  // Garage door
  "M1364 218 V200 H1402 V218",
].join(" ");

/** The ribbon: lower left to upper right, two soft waves, clear of every roof. */
const RIBBON = "M-20 104 C160 70 300 100 480 84 S780 44 960 58 S1280 16 1460 20";

function RibbonGradient({ id, night = false }: { id: string; night?: boolean }) {
  // On night the ribbon runs at full opacity (spec 3.6).
  const [start, mid, end] = night ? [1, 1, 1] : [0.9, 0.75, 0.6];
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" style={{ stopColor: "var(--color-aurora-green)", stopOpacity: start }} />
      <stop offset="0.5" style={{ stopColor: "var(--color-aurora-teal)", stopOpacity: mid }} />
      <stop offset="1" style={{ stopColor: "var(--color-aurora-violet)", stopOpacity: end }} />
    </linearGradient>
  );
}

const svgProps = { "aria-hidden": true, focusable: "false", xmlns: "http://www.w3.org/2000/svg" } as const;

/**
 * Stroke widths: the horizon keeps 2px (1.5px on phones) at any size; the
 * ribbon is 6px (4px on phones), its glow 18px at 0.14 opacity.
 */
const horizonClass = "fill-none stroke-ink [stroke-width:1.5px] sm:[stroke-width:2px] [stroke-linejoin:round] [vector-effect:non-scaling-stroke]";
const detailClass = "fill-none stroke-ink [stroke-width:1.5px] [vector-effect:non-scaling-stroke]";
const ribbonClass = "fill-none [stroke-linecap:round] [stroke-width:9] sm:[stroke-width:6]";
const glowClass = "fill-none [stroke-linecap:round] [stroke-width:27] sm:[stroke-width:18]";

/** Crops to the middle 60% below 640px, full width above. */
const cropClass = "block h-auto w-[166.667%] max-w-none -ml-[33.333%] sm:ml-0 sm:w-full";

/** The home hero's bottom edge: the street, with the ribbon drawing itself once on load. */
export function AuroraRoofline({ className = "" }: { className?: string }) {
  const gradientId = `aurora-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <div className={`overflow-hidden ${className}`}>
      <svg {...svgProps} viewBox="0 0 1440 220" className={cropClass} style={{ aspectRatio: "1440 / 220" }}>
        <defs>
          <RibbonGradient id={gradientId} />
        </defs>
        <path d={RIBBON} pathLength={1} stroke={`url(#${gradientId})`} opacity={0.14} className={`${glowClass} ribbon-draw`} />
        <path d={RIBBON} pathLength={1} stroke={`url(#${gradientId})`} className={`${ribbonClass} ribbon-draw`} />
        <path d={HORIZON} className={horizonClass} />
        <path d={DETAILS} className={detailClass} />
      </svg>
    </div>
  );
}

/** The footer's top edge on every page: a static, shorter crop of the street, no sky. */
export function RooflineCrop({ className = "" }: { className?: string }) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <svg {...svgProps} viewBox="0 84 1440 136" className={cropClass} style={{ aspectRatio: "1440 / 136" }}>
        <path d={HORIZON} className={horizonClass} />
        <path d={DETAILS} className={detailClass} />
      </svg>
    </div>
  );
}

/** The ribbon alone, at full opacity, along the top of the home page's night section. */
export function AuroraRibbon({ className = "" }: { className?: string }) {
  const gradientId = `ribbon-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <div className={`overflow-hidden ${className}`}>
      <svg {...svgProps} viewBox="0 0 1440 120" className={cropClass} style={{ aspectRatio: "1440 / 120" }}>
        <defs>
          <RibbonGradient id={gradientId} night />
        </defs>
        <path d={RIBBON} stroke={`url(#${gradientId})`} opacity={0.14} className={glowClass} />
        <path d={RIBBON} stroke={`url(#${gradientId})`} className={ribbonClass} />
      </svg>
    </div>
  );
}
