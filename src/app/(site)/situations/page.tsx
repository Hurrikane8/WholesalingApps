import { site } from "@/config/site";
import { getSituations } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { FinalCta, PageIntro, SituationList } from "@/components/sections";

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
      <PageIntro
        surface="frost"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Situations", path: "/situations" },
        ]}
        title="When selling isn't simple"
        lead={intro}
      />
      <div className="bg-frost pb-16 lg:pb-24">
        <div className="page-wrap">
          <SituationList situations={getSituations()} headingLevel={2} />
        </div>
      </div>
      <FinalCta formId="offer" />
    </>
  );
}
