import { site } from "@/config/site";
import { getLocation, locations } from "@/content/locations";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = `We buy houses across ${site.market.region}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return locations.map((l) => ({ city: l.slug }));
}

export default async function Image({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const l = getLocation(city);
  return renderOgImage({ title: l ? `We buy houses in ${l.city}, ${l.provinceAbbr}, as-is` : `We buy houses across ${site.market.region}` });
}
