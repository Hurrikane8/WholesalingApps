import { getFaqs } from "@/content/faqs";
import { pageMetadata } from "@/lib/seo";
import { Faq } from "@/components/ui/Faq";
import { CtaBand, PageIntro } from "@/components/sections";

export const metadata = pageMetadata({
  title: "Questions about selling your house for cash",
  description: "Straight answers about selling your house for cash in Edmonton: how offers work, fees, closing dates, repairs, foreclosure, probate and more.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
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
        <div className="page-wrap">
          {/* The one FAQPage block on the site (spec 7.3). */}
          <Faq items={getFaqs()} withSchema className="measure border-t-0 pt-4 lg:max-w-[52rem]" />
        </div>
      </div>
      <CtaBand />
    </>
  );
}
