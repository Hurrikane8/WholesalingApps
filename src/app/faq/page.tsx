import { getFaqs } from "@/content/faqs";
import { pageMetadata } from "@/lib/seo";
import { CtaBand, FaqSection, PageHeader } from "@/components/sections";

export const metadata = pageMetadata({
  title: "FAQ: Selling Your House for Cash",
  description: "Answers to common questions about selling your house for cash: how offers work, fees, closing timelines, repairs, foreclosure, probate and more.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq" },
        ]}
        eyebrow="FAQ"
        title="Questions About Selling Your House for Cash"
        subtitle="Straight answers about offers, fees, closing dates and more. Don't see your question? Call or text me."
      />
      <FaqSection items={getFaqs()} title="Everything you need to know" eyebrow="Frequently asked questions" />
      <CtaBand />
    </>
  );
}
