import { getPropertyType, getPropertyTypes } from "@/lib/content";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Homes I buy in Greater Edmonton";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getPropertyTypes().map((t) => ({ type: t.slug }));
}

export default async function Image({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const t = getPropertyType(type);
  return renderOgImage({ eyebrow: t?.label ?? "What I buy", title: t?.h1 ?? "What I buy in Greater Edmonton" });
}
