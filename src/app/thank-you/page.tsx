import Link from "next/link";
import { CircleCheck, Phone } from "lucide-react";
import { phoneHref, site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Thank You: We Received Your Request",
  description: `Thanks for contacting ${site.name}. We'll be in touch shortly about your property.`,
  path: "/thank-you",
  noindex: true,
});

export default function ThankYouPage() {
  const next = [
    `We'll review your property and reach out shortly. Our hours are ${site.hours.label}.`,
    "We'll ask a few quick questions and set up a short walkthrough, in person or by video.",
    `You'll get a written, no-obligation cash offer within ${site.promises.offerWithinHours} hours of the walkthrough.`,
  ];
  return (
    <section className="section">
      <div className="container-page max-w-2xl text-center">
        <CircleCheck className="mx-auto size-16 text-emerald-600" aria-hidden="true" />
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900">Thank you! We got your request.</h1>
        <p className="mt-4 text-lg text-slate-600">Here&apos;s what happens next:</p>
        <ol className="mt-8 space-y-4 text-left">
          {next.map((step, i) => (
            <li key={step} className="card flex items-start gap-4">
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
