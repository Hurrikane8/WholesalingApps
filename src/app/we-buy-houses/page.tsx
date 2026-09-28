import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { site } from "@/config/site";
import { locations } from "@/content/locations";
import { pageMetadata } from "@/lib/seo";
import { CtaBand, PageHeader } from "@/components/sections";

const { market } = site;

export const metadata = pageMetadata({
  title: `Areas We Serve: We Buy Houses Across ${market.region}`,
  description: `I buy houses, townhouses and condos across ${market.region}, including ${locations
    .slice(0, 3)
    .map((l) => l.city)
    .join(", ")} and more. Find your area, or send me the address.`,
  path: "/we-buy-houses",
});

export default function AreasPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Areas We Serve", path: "/we-buy-houses" },
        ]}
        eyebrow="Service areas"
        title={`We Buy Houses Across ${market.region}`}
        subtitle="Pick your area to see what selling there looks like, or send me the address and I'll tell you whether I buy there."
      />
      <section className="section">
        <div className="container-page">
          <ul className="grid gap-6 md:grid-cols-2">
            {locations.map((l) => (
              <li key={l.slug}>
                <Link href={`/we-buy-houses/${l.slug}`} className="card group flex h-full flex-col transition hover:border-brand-300 hover:shadow-md">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <MapPin className="size-4 text-brand-500" aria-hidden="true" />
                    {l.region ?? site.market.region}
                  </span>
                  <h2 className="mt-2 text-xl font-bold text-slate-900 group-hover:text-brand-700">
                    We Buy Houses in {l.city}, {l.provinceAbbr}
                  </h2>
                  <p className="mt-2 flex-1 text-slate-600">{l.intro}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 font-semibold text-brand-600">
                    Sell your {l.city} house
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
