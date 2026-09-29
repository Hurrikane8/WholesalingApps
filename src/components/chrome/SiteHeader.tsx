import Link from "next/link";
import { Phone } from "lucide-react";
import { phoneHref, site } from "@/config/site";
import { OFFER_PATH, primaryNav } from "@/config/nav";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { MobileMenu } from "@/components/chrome/MobileMenu";

/** Keyboard users can jump past the header. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded-button bg-white font-semibold text-ink focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 focus:px-4 focus:py-3"
    >
      Skip to content
    </a>
  );
}

const phoneButton = "inline-flex size-11 items-center justify-center rounded-button text-ink hover:bg-frost";

/**
 * The site header (spec 5.2): sticky, 64px, snow at 94% with a blur and a
 * mist rule. From 1024px: logo, four links, phone and "Get my offer". Below:
 * logo, a call button and the menu. Between 1024 and 1280px the phone number
 * shows as a call button too, so the row never wraps.
 */
export function SiteHeader() {
  const callLabel = `Call ${site.founder.firstName} at ${site.phone}`;
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-mist bg-snow/94 backdrop-blur-md">
      <SkipLink />
      <div className="page-wrap flex h-full items-center justify-between gap-2 sm:gap-4">
        <Link href="/" className="inline-flex min-h-11 shrink-0 items-center">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-11 items-center px-2.5 text-ink hover:text-pine hover:underline hover:underline-offset-4">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
          <a href={`tel:${phoneHref}`} className="link nums hidden font-semibold whitespace-nowrap xl:inline">
            {site.phone}
          </a>
          <a href={`tel:${phoneHref}`} aria-label={callLabel} className={`${phoneButton} xl:hidden`}>
            <Phone className="size-5" aria-hidden="true" />
          </a>
          <ButtonLink href={OFFER_PATH} compact className="hidden lg:inline-flex">
            Get my offer
          </ButtonLink>
          <div className="lg:hidden">
            <MobileMenu logo={<Logo compact />} phone={site.phone} phoneHref={phoneHref} />
          </div>
        </div>
      </div>
    </header>
  );
}
