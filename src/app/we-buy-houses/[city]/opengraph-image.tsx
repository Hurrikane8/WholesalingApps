import { getLocation, locations } from "@/content/locations";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "We buy houses for cash";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return locations.map((l) => ({ city: l.slug }));
}

export default async function Image({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const l = getLocation(city);
  return renderOgImage({
    eyebrow: l ? `Cash home buyers in ${l.city} & area` : "Cash home buyers",
    title: l ? `We Buy Houses in ${l.city}, ${l.provinceAbbr}` : "We Buy Houses for Cash",
  });
}
