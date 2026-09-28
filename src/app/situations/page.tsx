import { site } from "@/config/site";
import { getSituations } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { CtaBand, HowItWorks, PageHeader, SituationsGrid } from "@/components/sections";

const intro =
  "Foreclosure, an inheritance, a separation, tenants, repairs you can't afford, a move for work. Here's what to know about each, and how a direct sale works.";

export const metadata = pageMetadata({
  title: `Selling your house in a difficult situation in ${site.market.name}`,
  description: `Foreclosure, an inheritance, a separation, tenants or repairs you can't afford in ${site.market.name}? What to know about each, and how a direct sale works.`,
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
        eyebrow="Situations"
        title="When selling isn't simple"
        subtitle={intro}
      />
      <SituationsGrid situations={getSituations()} title="Find your situation" intro="Choose the one closest to yours to learn about your options, what to expect and common questions." />
      <HowItWorks />
      <CtaBand />
    </>
  );
}
