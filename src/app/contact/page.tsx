import { Clock, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { formatAddress, phoneHref, site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { LeadForm } from "@/components/LeadForm";
import { PageHeader } from "@/components/sections";

export const metadata = pageMetadata({
  title: "Contact Us",
  description: `Call, text or email ${site.name} about selling your house in ${site.market.region}. We're available ${site.hours.label}. Free, no-obligation cash offers.`,
  path: "/contact",
});

export default function ContactPage() {
  const items = [
    { icon: Phone, label: "Call us", value: site.phone, href: `tel:${phoneHref}` },
    { icon: MessageSquare, label: "Text us", value: site.phone, href: `sms:${phoneHref}` },
    { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    { icon: Clock, label: "Hours", value: site.hours.label },
    { icon: MapPin, label: "Serving", value: `${site.market.region} · ${formatAddress()}` },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
        eyebrow="Contact"
        title="Talk to a Real Person About Your House"
        subtitle="Questions about selling, or ready for an offer? Reach out however is easiest for you. There's never any obligation."
      />
      <section className="section">
        <div className="container-page grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="section-title">Get in touch</h2>
            <ul className="mt-8 space-y-5">
              {items.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    {href ? (
                      <a href={href} className="text-lg font-semibold text-slate-900 hover:text-brand-700">
                        {value}
                      </a>
                    ) : (
                      <p className="text-lg font-semibold text-slate-900">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6 shadow-lg sm:p-8">
            <LeadForm variant="plain" title="Request your cash offer" />
          </div>
        </div>
      </section>
    </>
  );
}
