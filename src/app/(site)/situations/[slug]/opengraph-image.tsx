import { site } from "@/config/site";
import { getSituation, getSituations } from "@/lib/content";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = `Selling a house in a difficult situation in ${site.market.name}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getSituations().map((s) => ({ slug: s.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getSituation(slug);
  return renderOgImage({ eyebrow: s?.label ?? "Situations", title: s?.h1 ?? "When selling isn't simple" });
}
