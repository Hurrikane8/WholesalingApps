import { notFound } from "next/navigation";
import { getPosts, getSituation, getSituations, renderMarkdown } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { serviceSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { Prose } from "@/components/Prose";
import { FaqSection, FinalCta, FormHero, PostList } from "@/components/sections";
import { StraightAnswer } from "@/components/ui/StraightAnswer";
import { TextLink } from "@/components/ui/TextLink";
import { DraftBanner } from "@/components/preview";

export const dynamicParams = false;

export function generateStaticParams() {
  return getSituations().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(props: PageProps<"/situations/[slug]">) {
  const { slug } = await props.params;
  const s = getSituation(slug);
  if (!s) return {};
  return pageMetadata({
    ownImage: true,
    title: s.title,
    description: s.description,
    path: `/situations/${s.slug}`,
    noindex: s.draft,
  });
}

export default async function SituationPage(props: PageProps<"/situations/[slug]">) {
  const { slug } = await props.params;
  const s = getSituation(slug);
  if (!s) notFound();

  const path = `/situations/${s.slug}`;
  const { html } = renderMarkdown(s.body);
  const guides = s.guides.map((slug) => getPosts().find((p) => p.slug === slug)).filter((p) => p !== undefined);

  return (
    <>
      <DraftBanner draft={s.draft} />
      <JsonLd data={serviceSchema({ name: s.h1, description: s.description, path })} />
      <FormHero
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Situations", path: "/situations" },
          { name: s.label, path },
        ]}
        title={s.h1}
        lead={s.summary}
        reason={s.reason}
      />

      <div className="border-t border-mist bg-snow">
        <div className="page-wrap py-16 lg:py-24">
          <StraightAnswer question={s.question} className="measure">
            <p>{s.answer}</p>
          </StraightAnswer>
          <article className="mt-12">
            <Prose html={html} />
          </article>
          {guides.length > 0 && (
            <section aria-labelledby="guides-heading" className="measure mt-14 border-t border-mist pt-10">
              <h2 id="guides-heading" className="type-h3">
                Related guides
              </h2>
              <div className="mt-4">
                <PostList posts={guides} />
              </div>
              <p className="mt-4 text-ink-2">
                Every kind of home I buy, from condo townhouses to fourplexes: <TextLink href="/what-we-buy">what I buy</TextLink>.
              </p>
            </section>
          )}
        </div>
      </div>

      {s.faqs.length > 0 && <FaqSection items={s.faqs} title={`${s.label}: questions sellers ask`} />}
      <FinalCta reason={s.reason} />
    </>
  );
}
