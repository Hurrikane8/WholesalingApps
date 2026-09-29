import Image from "next/image";
import { shownPropertyTypes, site } from "@/config/site";
import { founderDisplayName, promiseItems } from "@/lib/claims";
import { pageMetadata } from "@/lib/seo";
import { personSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { FinalCta, PageIntro, Section, Testimonials } from "@/components/sections";
import { Commitments } from "@/components/ui/Commitments";
import { FounderVideo } from "@/components/ui/FounderVideo";

const { market, name, founder } = site;

export const metadata = pageMetadata({
  title: `About ${founder.firstName} and ${name} in ${market.name}`,
  description: `I'm ${founderDisplayName()}, and I run ${name}. I buy houses, townhouses, duplexes and condos directly from owners across ${market.region}, as-is. Here's how I work.`,
  path: "/about",
});

/** "a, b and c" */
function joinList(items: string[]): string {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export default function AboutPage() {
  const types = joinList(shownPropertyTypes().map((t) => t.plural.toLowerCase()));
  const hasCommitments = promiseItems().length > 0;

  return (
    <>
      <JsonLd data={personSchema()} />
      <PageIntro
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
        title={`Hi, I'm ${founder.firstName}.`}
        lead={
          <>
            {founder.photo && (
              <Image
                src={founder.photo}
                alt={founder.photoAlt || `${founderDisplayName()}, ${founder.role}`}
                width={320}
                height={400}
                sizes="(min-width: 640px) 320px, 100vw"
                className="mb-6 w-full max-w-[320px] rounded-photo object-cover"
                priority
              />
            )}
            <p>
              I run {name}. I buy homes directly from owners across {market.region}: {types}, as-is. When you call, you get me.
            </p>
            {founder.shortBio && <p className="mt-4">{founder.shortBio}</p>}
          </>
        }
      />

      <Section surface="frost" labelledBy="aurora-heading">
        <h2 id="aurora-heading" className="type-h2">
          Why &ldquo;Aurora&rdquo;
        </h2>
        <p className="measure mt-5">
          I grew up in Manning, Alberta, on the Mackenzie Highway about 73 km north of Peace River, in the County of Northern Lights. The community was
          first known as Aurora. When it came time to incorporate, postal authorities disallowed the name to avoid confusion with Aurora, Ontario, and the
          town was named after Premier Ernest Manning instead. The business name is a nod to home.
        </p>
        <p className="type-fine mt-4 text-ink-3">Source: The Canadian Encyclopedia, &ldquo;Manning&rdquo;.</p>
      </Section>

      <Section id="how-i-buy" labelledBy="buy-heading">
        <h2 id="buy-heading" className="type-h2">
          How I buy
        </h2>
        <p className="measure mt-5">
          I&apos;m not a realtor, and I don&apos;t list homes. I buy them. Sometimes I buy a home myself; sometimes I sign a contract to buy it and assign
          that contract to another investor. Either way, you&apos;ll know which, in writing, before you sign.
        </p>
        <div className="measure mt-8 border-l-4 border-mist pl-5">
          <h3 className="type-h3">Disclosure</h3>
          <p className="type-small mt-2 text-ink-2">{site.disclosure}</p>
          <p className="type-small mt-2 text-ink-2">Offers are free and carry no obligation. Have a lawyer or a trusted advisor review anything before you sign.</p>
        </div>
      </Section>

      {hasCommitments && (
        <Section surface="frost" labelledBy="commitments-heading">
          <h2 id="commitments-heading" className="type-h2">
            What I&apos;ve committed to
          </h2>
          <Commitments className="mt-8 max-w-3xl" />
          <FounderVideo className="mt-12" />
        </Section>
      )}

      {site.team.length > 0 && (
        <Section labelledBy="team-heading">
          <h2 id="team-heading" className="type-h2">
            The people you&apos;ll work with
          </h2>
          <ul className="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {site.team.map((m) => (
              <li key={m.name} className="border-t border-mist pt-5">
                {m.photo && <Image src={m.photo} alt={`${m.name}, ${m.role}`} width={400} height={400} className="mb-4 aspect-square w-full rounded-photo object-cover" />}
                <h3 className="type-h3">{m.name}</h3>
                <p className="type-small text-ink-2">{m.role}</p>
                <p className="mt-2 text-ink-2">{m.bio}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Testimonials surface="frost" />
      <FinalCta formId="offer" title="Talk to me about your place." />
    </>
  );
}
