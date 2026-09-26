import { getSituation, getSituations } from "@/lib/content";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Sell your house fast in any situation";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getSituations().map((s) => ({ slug: s.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getSituation(slug);
  return renderOgImage({ eyebrow: s?.label ?? "Any situation", title: s?.h1 ?? "Sell Your House Fast for Cash" });
}
