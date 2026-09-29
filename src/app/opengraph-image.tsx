import { site } from "@/config/site";
import { isVerified } from "@/lib/claims";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = `${site.name}: sell your ${site.market.name} home as-is`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  // Cards are shared beyond the site, so only a verified claim reaches the headline, even in preview builds.
  const { name } = site.market;
  return renderOgImage({
    title: isVerified("explainsOfferMath") ? `Sell your ${name} home as-is. See the math first.` : `Sell your ${name} home as-is, to a real person.`,
  });
}
