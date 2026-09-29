import { site } from "@/config/site";
import { getMarkdownPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/LegalPage";

export const metadata = pageMetadata({
  title: "Terms of Use",
  description: `The terms that govern use of the ${site.name} website, including our text messaging terms and disclosures.`,
  path: "/terms",
});

export default function TermsPage() {
  const { data, html } = getMarkdownPage("legal/terms");
  return <LegalPage title="Terms of Use" path="/terms" updated={data.updated} html={html} />;
}
