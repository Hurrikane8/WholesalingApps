import Link from "next/link";
import { CircleCheck, Phone } from "lucide-react";
import { phoneHref, site } from "@/config/site";
import { isUnconfirmed, offerMathClause, offerTimingPhrase } from "@/lib/claims";
import { pageMetadata } from "@/lib/seo";
import { Unconfirmed } from "@/components/preview";

export const metadata = pageMetadata({
  title: "Thanks: I've got your request",
  description: `Thanks for contacting ${site.name}. I'll be in touch about your property.`,
  path: "/thank-you",
  noindex: true,
});

export default function ThankYouPage() {
  const { duringHours, afterHours } = site.responsePromise;
  const next = [
    duringHours
      ? `I'll call you ${duringHours} from ${site.phone}. After hours, I'll call ${afterHours}.`
      : `I'll call you from ${site.phone}. Save the number so you know it's me.`,
    "I'll ask a few questions and set up one short visit, in person or by video.",
    <>
      You&apos;ll get a written, no-obligation cash offer {offerTimingPhrase()}
      {offerMathClause()}.
      <Unconfirmed show={isUnconfirmed("offerWithinHours")} />
    </>,
  ];
  return (
    <section className="section">
      <div className="container-page max-w-2xl text-center">
        <CircleCheck className="mx-auto size-16 text-emerald-600" aria-hidden="true" />
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900">Thanks. I&apos;ve got your request.</h1>
        <p className="mt-4 text-lg text-slate-600">Here&apos;s what happens next:</p>
        <ol className="mt-8 space-y-4 text-left">
          {next.map((step, i) => (
            <li key={i} className="card flex items-start gap-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-400 font-bold text-slate-900">{i + 1}</span>
              <span className="pt-1 text-slate-700">{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-slate-600">Want to talk now?</p>
        <a href={`tel:${phoneHref}`} className="btn-primary mt-3 text-lg">
          <Phone className="size-5" aria-hidden="true" />
          Call {site.phone}
        </a>
        <p className="mt-10">
          <Link href="/blog" className="font-semibold text-brand-600 hover:underline">
            Browse our seller guides while you wait
          </Link>
        </p>
      </div>
    </section>
  );
}
