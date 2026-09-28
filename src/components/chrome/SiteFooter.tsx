import Link from "next/link";
import { focusFooterNav, footerNav } from "@/config/nav";
import { phoneHref, site } from "@/config/site";
import { Logo } from "@/components/brand/Logo";
import { RooflineCrop } from "@/components/brand/AuroraRoofline";
import { TextLink } from "@/components/ui/TextLink";

function FinePrint() {
  const year = new Date().getFullYear();
  return (
    <>
      <p className="type-fine measure text-ink-2">
        <strong className="font-semibold text-ink">Disclosure:</strong> {site.disclosure}
      </p>
      <p className="type-fine mt-3 text-ink-2">
        © {year} {site.legalName}. General information, not legal, tax or financial advice.
      </p>
    </>
  );
}

/**
 * The footer (spec 5.2): a static crop of the roofline as its top edge, one
 * sentence, how to reach Kane, three short link groups and the disclosure.
 * No lists of every city and situation; the hubs link to those.
 */
export function SiteFooter() {
  return (
    <footer className="bg-frost">
      <RooflineCrop className="text-ink" />
      <div className="page-wrap grid gap-10 pt-10 pb-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <Logo />
          <p className="measure mt-4 text-ink-2">I buy houses, townhouses, duplexes and condos directly from owners across {site.market.region}.</p>
          <ul className="type-small mt-4 text-ink">
            <li>
              Call{" "}
              <TextLink href={`tel:${phoneHref}`} className="nums inline-flex min-h-11 items-center font-semibold">
                {site.phone}
              </TextLink>
            </li>
            <li>
              Text{" "}
              <TextLink href={`sms:${phoneHref}`} className="nums inline-flex min-h-11 items-center font-semibold">
                {site.phone}
              </TextLink>
            </li>
            {site.email && (
              <li>
                Email{" "}
                <TextLink href={`mailto:${site.email}`} className="inline-flex min-h-11 items-center">
                  {site.email}
                </TextLink>
              </li>
            )}
            <li className="mt-1 text-ink-2">{site.hours.label}</li>
          </ul>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {footerNav.map((group) => (
            <div key={group.title}>
              <h2 className="type-small font-bold text-ink">{group.title}</h2>
              <ul className="mt-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="type-small inline-flex min-h-11 min-w-11 items-center text-ink-2 hover:text-pine hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="page-wrap pb-10">
        <div className="border-t border-mist pt-6">
          <FinePrint />
        </div>
      </div>
    </footer>
  );
}

/** Focus layout (/get-cash-offer, /hello): logo and phone only, no navigation. */
export function FocusHeader() {
  return (
    <header className="h-16 border-b border-mist bg-snow">
      <div className="page-wrap flex h-full items-center justify-between gap-4">
        <Link href="/" className="inline-flex min-h-11 shrink-0 items-center">
          <Logo />
        </Link>
        <a href={`tel:${phoneHref}`} className="link nums inline-flex min-h-11 items-center font-semibold whitespace-nowrap max-sm:hidden">
          {site.phone}
        </a>
        <a
          href={`tel:${phoneHref}`}
          aria-label={`Call ${site.founder.firstName} at ${site.phone}`}
          className="inline-flex size-11 items-center justify-center rounded-button font-semibold text-ink hover:bg-frost sm:hidden"
        >
          Call
        </a>
      </div>
    </header>
  );
}

/** The focus layout's slim footer: the disclosure and the legal links. */
export function FocusFooter() {
  return (
    <footer className="border-t border-mist bg-frost">
      <div className="page-wrap py-8">
        <FinePrint />
        <ul className="type-fine mt-3 flex gap-4">
          {focusFooterNav.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="inline-flex min-h-11 min-w-11 items-center text-ink-2 underline underline-offset-3 hover:text-pine">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
