import { site } from "@/config/site";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = `${site.name}: we buy houses for cash in ${site.market.region}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({ eyebrow: `Cash home buyers · ${site.market.region}`, title: `Sell Your House Fast for Cash in ${site.market.name}` });
}
