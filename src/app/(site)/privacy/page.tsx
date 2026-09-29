import { site } from "@/config/site";
import { getMarkdownPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/LegalPage";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses and protects your information, including our text messaging policy.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  const { data, html } = getMarkdownPage("legal/privacy");
  return <LegalPage title="Privacy Policy" path="/privacy" updated={data.updated} html={html} />;
}
