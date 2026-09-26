import { site } from "@/config/site";
import { getSituations } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { CtaBand, HowItWorks, PageHeader, SituationsGrid } from "@/components/sections";

export const metadata = pageMetadata({
  title: "Sell Your House in Any Situation",
  description: `Facing foreclosure, an inherited house, divorce, problem tenants or costly repairs? We buy houses as-is for cash across ${site.market.region}. See how we can help.`,
  path: "/situations",
});

export default function SituationsPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Situations", path: "/situations" },
        ]}
        eyebrow="Situations we help with"
        title="Sell Your House Fast, Whatever Your Situation"
        subtitle="Life doesn't always line up with a traditional listing. These are the situations homeowners bring to us most often, and how a direct cash sale can help with each."
      />
      <SituationsGrid situations={getSituations()} title="Find your situation" intro="Choose the one closest to yours to learn about your options, what to expect and common questions." />
      <HowItWorks />
      <CtaBand />
    </>
  );
}
