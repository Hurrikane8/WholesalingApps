import { markPng } from "@/lib/brand-image";

export const dynamic = "force-static";

/** /brand/logo.png: a 512×512 PNG of the mark on snow, the logo in structured data (spec 7.3). */
export function GET() {
  return markPng(512, { inset: 0.12 });
}
