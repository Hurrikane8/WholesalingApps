import Image from "next/image";
import { CircleCheck } from "lucide-react";
import { shownPropertyTypes, site } from "@/config/site";
import { founderDisplayName, promiseItems } from "@/lib/claims";
import { pageMetadata } from "@/lib/seo";
import { CtaBand, PageHeader, Testimonials } from "@/components/sections";
import { Unconfirmed } from "@/components/preview";

const { market, name, founder } = site;

export const metadata = pageMetadata({
  title: `About ${founderDisplayName()} and ${name} in ${market.name}`,
  description: `I'm ${founderDisplayName()}, and I run ${name}. I buy houses, townhouses, duplexes and condos directly from owners across ${market.region}, as-is. Here's how I work.`,
  path: "/about",
});

/** "a, b and c" */
function joinList(items: string[]): string {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export default function AboutPage() {
  const types = joinList(shownPropertyTypes().map((t) => t.plural.toLowerCase()));
  const commitments = promiseItems();

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
        eyebrow="About"
        title={`Hi, I'm ${founder.firstName}.`}
        subtitle={`I run ${name}. I buy homes directly from owners across ${market.region}: ${types}, as-is. When you call, you get me.`}
      />

      <section className="section">
        <div className="container-page grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="space-y-5 text-lg leading-relaxed text-slate-700">
            {founder.photo && (
              <Image
                src={founder.photo}
                alt={founder.photoAlt || founderDisplayName()}
                width={480}
                height={480}
                className="aspect-square w-full max-w-sm rounded-2xl object-cover"
              />
            )}
            {founder.shortBio && <p>{founder.shortBio}</p>}

            <h2 className="section-title">Why &ldquo;Aurora&rdquo;</h2>
            <p>
              I grew up in Manning, Alberta, on the Mackenzie Highway about 73 km north of Peace River, in the County of
              Northern Lights. The community was first known as Aurora. When it came time to incorporate, postal
              authorities disallowed the name to avoid confusion with Aurora, Ontario, and the town was named after
              Premier Ernest Manning instead. The business name is a nod to home.
            </p>
            <p className="text-sm text-slate-600">Source: The Canadian Encyclopedia, &ldquo;Manning&rdquo;.</p>
          </div>

          <div id="how-i-buy" className="card self-start scroll-mt-28 bg-slate-50">
            <h2 className="text-xl font-bold text-slate-900">How I buy</h2>
            <p className="mt-3 text-slate-700">
              I&apos;m not a realtor, and I don&apos;t list homes. I buy them. Sometimes I buy a home myself; sometimes I
              sign a contract to buy it and assign that contract to another investor. Either way, you&apos;ll know which,
              in writing, before you sign.
            </p>
            <h3 className="mt-6 font-bold text-slate-900">Disclosure</h3>
            <p className="mt-2 text-slate-700">{site.disclosure}</p>
            <p className="mt-3 text-slate-700">
              Offers are free and carry no obligation. Have a lawyer or a trusted advisor review anything before you sign.
            </p>
          </div>
        </div>
      </section>

      {commitments.length > 0 && (
        <section className="section bg-slate-50">
          <div className="container-page">
            <p className="eyebrow">Commitments</p>
            <h2 className="section-title mt-2">What I&apos;ve committed to</h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {commitments.map((item) => (
                <li key={item.flag} className="card">
                  <CircleCheck className="size-7 text-emerald-600" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    {item.title}
                    <Unconfirmed show={item.unconfirmed} />
                  </h3>
                  <p className="mt-2 text-slate-600">{item.sentence}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {site.team.length > 0 && (
        <section className="section">
          <div className="container-page">
            <p className="eyebrow">Team</p>
            <h2 className="section-title mt-2">The people you&apos;ll work with</h2>
            <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {site.team.map((m) => (
                <li key={m.name} className="card">
                  {m.photo && (
                    <Image src={m.photo} alt={`${m.name}, ${m.role}`} width={400} height={400} className="mb-5 aspect-square w-full rounded-xl object-cover" />
                  )}
                  <h3 className="text-lg font-bold text-slate-900">{m.name}</h3>
                  <p className="text-sm font-medium text-brand-600">{m.role}</p>
                  <p className="mt-3 text-slate-600">{m.bio}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <Testimonials />
      <CtaBand />
    </>
  );
}
