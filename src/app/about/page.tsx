import Image from "next/image";
import { FileText, HeartHandshake, MapPin, ShieldCheck } from "lucide-react";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { CtaBand, PageHeader, Testimonials } from "@/components/sections";

const { market, name } = site;

export const metadata = pageMetadata({
  title: `About Us: Local Cash Home Buyers in ${market.region}`,
  description: `${name} buys houses directly from homeowners in ${market.region}. Learn who we are, how we work, and the promises we make to every seller.`,
  path: "/about",
});

const values = [
  {
    icon: FileText,
    title: "Honest numbers",
    text: "We show you how we calculate every offer and put it in writing. If listing with an agent would net you more, we'll say so.",
  },
  {
    icon: ShieldCheck,
    title: "Upfront about how we buy",
    text: "We tell you in writing who is buying your house, including if we plan to assign our contract to another buyer.",
  },
  {
    icon: HeartHandshake,
    title: "Respect for your situation",
    text: "Foreclosure, loss, divorce and financial stress are hard. We keep things private, patient and free of pressure.",
  },
  {
    icon: MapPin,
    title: "Local and accountable",
    text: `We buy in ${market.region} and close through local real estate lawyers, so you always know who you're dealing with.`,
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
        eyebrow="About us"
        title={`About ${name}`}
        subtitle={`We're a local real estate investment company that buys houses directly from homeowners across ${market.region}: as-is, for cash, on their timeline.`}
      />

      <section className="section">
        <div className="container-page grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="space-y-5 text-lg leading-relaxed text-slate-700">
            <h2 className="section-title">Why we do this</h2>
            <p>
              Selling a house the traditional way works well when the home is in great shape and you have months to
              spare. But many homeowners we meet don&apos;t have that luxury. They&apos;ve inherited a house that needs
              work, fallen behind on payments, are going through a separation, own a condo townhouse where the fees
              and assessments keep climbing, or are simply worn out by a rental that never stops needing attention.
            </p>
            <p>
              {name} gives those homeowners a straightforward alternative. We buy houses, condos and townhouses in
              any condition, pay cash, and close when it suits you, with no repairs, no showings and no commissions.
            </p>
            <p>
              Most of the homes we buy end up with local investors who renovate them and put them back to use, as
              updated homes to own or rent. That&apos;s good for the neighbourhood too.
            </p>
            {site.foundedYear && (
              <p>
                We&apos;ve been buying houses in {market.region} since {site.foundedYear}.
              </p>
            )}
          </div>
          <div className="card self-start bg-slate-50">
            <h2 className="text-xl font-bold text-slate-900">Our disclosure to every seller</h2>
            <p className="mt-3 text-slate-700">{site.disclosure}</p>
            <p className="mt-3 text-slate-700">
              Our offers are always free and carry no obligation. You&apos;re welcome to have a lawyer or trusted
              advisor review anything before you sign.
            </p>
            {site.nameStory && (
              <>
                <h2 className="mt-8 text-xl font-bold text-slate-900">The story behind our name</h2>
                <p className="mt-3 text-slate-700">{site.nameStory}</p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container-page">
          <p className="eyebrow">What we stand for</p>
          <h2 className="section-title mt-2">How we treat every homeowner</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {site.team.length > 0 && (
        <section className="section">
          <div className="container-page">
            <p className="eyebrow">Our team</p>
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
