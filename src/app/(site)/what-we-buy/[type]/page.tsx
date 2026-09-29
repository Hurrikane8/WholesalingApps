import { notFound } from "next/navigation";
import { getPropertyType, getPropertyTypes, getSituations, renderMarkdown } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { propertyTypeServiceSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { Prose } from "@/components/Prose";
import { DraftBanner } from "@/components/preview";
import { FaqSection, FinalCta, FormHero, Section, SituationList } from "@/components/sections";
import { SampleOffer } from "@/components/ui/SampleOffer";
import { StraightAnswer } from "@/components/ui/StraightAnswer";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPropertyTypes().map((t) => ({ type: t.slug }));
}

export async function generateMetadata(props: PageProps<"/what-we-buy/[type]">) {
  const { type } = await props.params;
  const t = getPropertyType(type);
  if (!t) return {};
  return pageMetadata({
    title: t.title,
    description: t.description,
    path: `/what-we-buy/${t.slug}`,
    image: { path: `/what-we-buy/${t.slug}/opengraph-image`, alt: t.h1 },
    noindex: t.draft,
  });
}

/** A property type page (spec 5.7): the form with the type preselected, a straight answer, the guide, a sample offer and questions. */
export default async function PropertyTypePage(props: PageProps<"/what-we-buy/[type]">) {
  const { type } = await props.params;
  const t = getPropertyType(type);
  if (!t) notFound();

  const path = `/what-we-buy/${t.slug}`;
  const { html } = renderMarkdown(t.body);
  const related = t.related.map((slug) => getSituations().find((s) => s.slug === slug)).filter((s) => s !== undefined);

  return (
    <>
      <DraftBanner draft={t.draft} />
      <JsonLd data={propertyTypeServiceSchema({ name: t.h1, description: t.description, path })} />
      <FormHero
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "What I buy", path: "/what-we-buy" },
          { name: t.label, path },
        ]}
        title={t.h1}
        lead={t.summary}
        propertyType={t.leadValue}
      />

      <div className="border-t border-mist bg-snow">
        <div className="page-wrap py-16 lg:py-24">
          <StraightAnswer question={t.question} className="measure">
            <p>{t.answer}</p>
          </StraightAnswer>
          <article className="mt-12">
            <Prose html={html} />
          </article>
        </div>
      </div>

      <Section surface="frost" labelledBy="sample-heading" innerClassName="grid gap-y-8 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-5">
          <h2 id="sample-heading" className="type-h2">
            What an offer looks like
          </h2>
          <p className="measure mt-4 text-ink-2">A sample, not a real property: the numbers behind an offer, from the after-repair value down.</p>
        </div>
        <SampleOffer id={t.sample} className="lg:col-span-7" />
      </Section>

      {t.faqs.length > 0 && <FaqSection items={t.faqs} title={`${t.label}: questions sellers ask`} surface="snow" />}

      {related.length > 0 && (
        <Section surface="frost" labelledBy="related-heading">
          <h2 id="related-heading" className="type-h2">
            Selling because of something else too?
          </h2>
          <div className="mt-6">
            <SituationList situations={related} />
          </div>
        </Section>
      )}

      <FinalCta propertyType={t.leadValue} />
    </>
  );
}
