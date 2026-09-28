import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone } from "lucide-react";
import { phoneHref, site } from "@/config/site";
import { getSituation, getSituations, renderMarkdown } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { serviceSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { Prose } from "@/components/Prose";
import { CtaBand, FaqSection, FormHero, HowItWorks, SituationsGrid } from "@/components/sections";
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
  const others = getSituations().filter((o) => o.slug !== s.slug).slice(0, 6);

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
        eyebrow={s.label}
        title={s.h1}
        subtitle={s.summary}
        reason={s.reason}
      />

      <section className="section">
        <div className="container-page grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article>
            <Prose html={html} />
          </article>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="card bg-brand-900 text-white">
              <p className="text-lg font-bold">Talk it through with me</p>
              <p className="mt-2 text-sm text-brand-100">
                No pressure and no obligation. I&apos;ll listen, answer your questions and explain your options, even
                if selling to me isn&apos;t the right fit.
              </p>
              <a href={`tel:${phoneHref}`} className="btn-primary mt-5 w-full">
                <Phone className="size-5" aria-hidden="true" />
                {site.phone}
              </a>
              <Link href="#offer-form" className="btn-ghost-light mt-3 w-full text-sm">
                Request an offer online
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <HowItWorks />
      {s.faqs.length > 0 && <FaqSection items={s.faqs} title={`${s.label}: common questions`} />}
      <SituationsGrid situations={others} title="Other situations" intro="Every seller's story is different. Here are other situations where a direct sale can help." />
      <CtaBand />
    </>
  );
}
