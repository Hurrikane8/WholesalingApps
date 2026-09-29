import { faqGroups, getFaqs } from "@/content/faqs";
import { pageMetadata } from "@/lib/seo";
import { faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { Faq } from "@/components/ui/Faq";
import { CtaBand, PageIntro } from "@/components/sections";

export const metadata = pageMetadata({
  title: "Questions about selling your house for cash",
  description: "Straight answers about selling your house for cash in Edmonton: how offers work, fees, closing dates, repairs, foreclosure, estates and who I am.",
  path: "/faq",
});

/** The FAQ (spec 5.17): four groups, and the one FAQPage block on the site. */
export default function FaqPage() {
  const groups = faqGroups();
  return (
    <>
      <JsonLd data={faqSchema(getFaqs())} />
      <PageIntro
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq" },
        ]}
        title="Questions about selling your house for cash"
        lead="Straight answers about offers, fees, closing dates and more. Don't see your question? Call or text me."
        surface="frost"
      />
      <div className="border-t border-mist bg-frost pb-16 lg:pb-24">
        <div className="page-wrap space-y-12 pt-10">
          {groups.map((group, i) => (
            <section key={group.title} aria-labelledby={`faq-group-${i}`} className="grid gap-y-4 lg:grid-cols-12 lg:gap-x-12">
              <h2 id={`faq-group-${i}`} className="type-h3 lg:col-span-4">
                {group.title}
              </h2>
              <Faq items={group.items} className="lg:col-span-8" />
            </section>
          ))}
        </div>
      </div>
      <CtaBand />
    </>
  );
}
