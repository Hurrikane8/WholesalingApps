import { site } from "@/config/site";
import { locations } from "@/content/locations";
import { pageMetadata } from "@/lib/seo";
import { FinalCta, PageIntro } from "@/components/sections";
import { TextLink } from "@/components/ui/TextLink";

const { market } = site;

export const metadata = pageMetadata({
  title: `Areas I buy in: houses and condos across ${market.region}`,
  description: `I buy houses, townhouses and condos across ${market.region}, including ${locations
    .slice(0, 3)
    .map((l) => l.city)
    .join(", ")} and more. Find your area, or send me the address.`,
  path: "/we-buy-houses",
});

export default function AreasPage() {
  return (
    <>
      <PageIntro
        surface="frost"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Areas I buy in", path: "/we-buy-houses" },
        ]}
        title={`Areas I buy in across ${market.region}`}
        lead="Pick your area to see what selling there looks like, or send me the address and I'll tell you whether I buy there."
      />
      <div className="bg-frost pb-16 lg:pb-24">
        <ul className="page-wrap grid gap-x-12 lg:grid-cols-2">
          {locations.map((l) => (
            <li key={l.slug} className="border-t border-mist py-6">
              <h2 className="type-h3">
                <TextLink href={`/we-buy-houses/${l.slug}`}>
                  {l.city}, {l.provinceAbbr}
                </TextLink>
              </h2>
              {l.region && <p className="type-small mt-1 text-ink-3">{l.region}</p>}
              <p className="type-small measure mt-2 text-ink-2">{l.intro}</p>
            </li>
          ))}
        </ul>
      </div>
      <FinalCta formId="offer" />
    </>
  );
}
