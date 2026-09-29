import { OFFER_PATH } from "@/config/nav";
import { shownPropertyTypes, site } from "@/config/site";
import { isShown, isUnconfirmed } from "@/lib/claims";
import { pageMetadata } from "@/lib/seo";
import { Unconfirmed } from "@/components/preview";
import { FinalCta, PageIntro, Section } from "@/components/sections";
import { ButtonLink } from "@/components/ui/Button";

const { market } = site;

export const metadata = pageMetadata({
  title: `What I buy: houses, townhouses and condos in ${market.name}`,
  description: `I buy condo townhouses, houses, half duplexes, freehold townhouses, apartment condos and small multi-unit buildings across ${market.region}, as-is.`,
  path: "/what-we-buy",
});

/** "a house", "an apartment condo" */
function withArticle(noun: string): string {
  return `${/^[aeiou]/i.test(noun) ? "an" : "a"} ${noun}`;
}

/** The property types hub (spec 5.6): each shown type as a section block, not a card. */
export default function WhatWeBuyPage() {
  const types = shownPropertyTypes();
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "What I buy", path: "/what-we-buy" },
        ]}
        title={`What I buy in ${market.region}`}
        lead="I buy homes directly from owners, as-is. Here's what that covers."
      />

      <div className="bg-snow pb-16 lg:pb-24">
        <ul className="page-wrap">
          {types.map((t) => (
            <li key={t.value} className="grid gap-4 border-t border-mist py-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-12">
              <div>
                <h2 className="type-h3">{t.plural}</h2>
                <p className="measure mt-2 text-ink-2">{t.note}</p>
              </div>
              <ButtonLink href={`${OFFER_PATH}?type=${encodeURIComponent(t.value)}`} variant="secondary" className="justify-self-start">
                Get an offer on {withArticle(t.singular)}
              </ButtonLink>
            </li>
          ))}
        </ul>
      </div>

      {isShown("tellsWhenListingWins") && (
        <Section surface="frost" labelledBy="not-right-heading">
          <h2 id="not-right-heading" className="type-h2">
            When I&apos;m not the right buyer
            <Unconfirmed show={isUnconfirmed("tellsWhenListingWins")} />
          </h2>
          <p className="measure mt-5">
            If your home is move-in ready and you have time to sell, listing will probably net you more, and I&apos;ll say so. If it&apos;s outside the areas
            I buy in, I&apos;ll tell you that too.
          </p>
        </Section>
      )}

      <FinalCta formId="offer" />
    </>
  );
}
