import { BRAND } from "./colors";

/**
 * The interim mark (spec 3.5): an "A" drawn as a steep gable roof, with an
 * aurora ribbon as its crossbar that runs past the right leg, like light
 * trailing off the roof. viewBox 0 0 64 64.
 *
 * Plain SVG elements and no hooks, so next/og image routes can render it too.
 * If Kane's own logo lands in public/brand/logo.svg, swap it in here.
 */
export const MARK_ROOF = "M9 56 L32 9 L55 56";
export const MARK_RIBBON = "M12 38 C 20 31, 27 44, 35 37 S 49 30, 58 35";

type MarkOptions = { gradientId: string; ink?: string; roofWidth?: number; ribbonWidth?: number };

/**
 * The mark's SVG children as an array of intrinsic elements. next/og (Satori)
 * only accepts intrinsic elements inside <svg>, so image routes call this
 * directly; pages use <MarkShapes>.
 */
export function markElements({ gradientId, ink = BRAND.ink, roofWidth = 7, ribbonWidth = 5.5 }: MarkOptions) {
  return [
    <defs key="defs">
      <linearGradient id={gradientId} x1="12" y1="0" x2="58" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={BRAND.auroraGreen} />
        <stop offset="0.5" stopColor={BRAND.auroraTeal} />
        <stop offset="1" stopColor={BRAND.auroraViolet} />
      </linearGradient>
    </defs>,
    <path key="roof" d={MARK_ROOF} fill="none" stroke={ink} strokeWidth={roofWidth} strokeLinejoin="miter" strokeLinecap="butt" />,
    <path key="ribbon" d={MARK_RIBBON} fill="none" stroke={`url(#${gradientId})`} strokeWidth={ribbonWidth} strokeLinecap="round" />,
  ];
}

export function MarkShapes(props: MarkOptions) {
  return <>{markElements(props)}</>;
}
