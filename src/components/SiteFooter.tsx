import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { formatAddress, phoneHref, site } from "@/config/site";
import { companyNav, legalNav } from "@/config/nav";
import { locations } from "@/content/locations";
import { getSituations } from "@/lib/content";
import { Mark } from "@/components/brand/Mark";

export function SiteFooter() {
  const situations = getSituations();
  const year = new Date().getFullYear();

  return (
    <footer data-legacy-chrome="" className="bg-brand-950 pb-24 text-slate-300 lg:pb-0">
      <div className="container-page grid grid-cols-1 gap-10 py-14 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link href="/" className="flex items-center gap-2.5 text-white">
            <Mark tone="snow" className="size-9" />
            <span className="text-lg font-bold">{site.name}</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            I buy houses, townhouses, duplexes and condos directly from owners across {site.market.region}.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            <li>
              <a href={`tel:${phoneHref}`} className="flex items-center gap-2.5 font-semibold text-white hover:text-accent-300">
                <Phone className="size-4 text-accent-400" aria-hidden="true" />
                {site.phone}
              </a>
            </li>
            {site.email && (
              <li>
                <a href={`mailto:${site.email}`} className="flex items-center gap-2.5 hover:text-white">
                  <Mail className="size-4 text-accent-400" aria-hidden="true" />
                  {site.email}
                </a>
              </li>
            )}
            <li className="flex items-center gap-2.5">
              <MapPin className="size-4 text-accent-400" aria-hidden="true" />
              {formatAddress()}
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="size-4 text-accent-400" aria-hidden="true" />
              {site.hours.label}
            </li>
          </ul>
        </div>

        <FooterColumn title="Situations" className="lg:col-span-3">
          {situations.map((s) => (
            <li key={s.slug}>
              <Link href={`/situations/${s.slug}`} className="hover:text-white">
                {s.label}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Areas We Buy" className="lg:col-span-3">
          {locations.map((l) => (
            <li key={l.slug}>
              <Link href={`/we-buy-houses/${l.slug}`} className="hover:text-white">
                We Buy Houses {l.city}, {l.provinceAbbr}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Company" className="lg:col-span-2">
          {[...companyNav, ...legalNav].map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:text-white">
                {l.label}
              </Link>
            </li>
          ))}
        </FooterColumn>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page space-y-3 py-6 text-sm leading-relaxed text-slate-400">
          <p>
            <strong className="text-slate-300">Disclosure:</strong> {site.disclosure}
          </p>
          <p>
            © {year} {site.legalName}. All rights reserved. The information on this site is general in nature and
            is not legal, tax or financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title} className={className}>
      <p className="text-sm font-semibold uppercase tracking-wider text-white">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">{children}</ul>
    </nav>
  );
}
