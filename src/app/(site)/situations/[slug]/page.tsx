import { notFound } from "next/navigation";
import { getSituation, getSituations, renderMarkdown } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { serviceSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { Prose } from "@/components/Prose";
import { FaqSection, FinalCta, FormHero } from "@/components/sections";
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
    title: s.title,
    description: s.description,
    path: `/situations/${s.slug}`,
    image: { path: `/situations/${s.slug}/opengraph-image`, alt: s.h1 },
    noindex: s.draft,
  });
}

export default async function SituationPage(props: PageProps<"/situations/[slug]">) {
  const { slug } = await props.params;
  const s = getSituation(slug);
  if (!s) notFound();

  const path = `/situations/${s.slug}`;
  const { html } = renderMarkdown(s.body);

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
        <article className="page-wrap py-16 lg:py-24">
          <Prose html={html} />
        </article>
      </div>

      {s.faqs.length > 0 && <FaqSection items={s.faqs} title={`${s.label}: questions sellers ask`} />}
      <FinalCta reason={s.reason} />
    </>
  );
}
