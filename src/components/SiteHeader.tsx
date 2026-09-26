import Link from "next/link";
import { Phone } from "lucide-react";
import { phoneHref, site } from "@/config/site";
import { OFFER_PATH, mainNav } from "@/config/nav";
import { LogoMark } from "@/components/icons";
import { MobileNav } from "@/components/MobileNav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 xl:h-20">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${site.name} home`}>
          <LogoMark className="size-9 shrink-0" />
          <span className="text-lg font-bold leading-tight tracking-tight text-brand-900 xl:whitespace-nowrap">{site.name}</span>
        </Link>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="whitespace-nowrap rounded-md px-2.5 py-2 text-[0.94rem] font-medium text-slate-700 hover:bg-slate-100 hover:text-brand-800"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${phoneHref}`}
            className="hidden items-center gap-2 whitespace-nowrap font-semibold text-brand-800 hover:text-brand-600 md:flex"
          >
            <Phone className="size-4" aria-hidden="true" />
            {site.phone}
          </a>
          <Link href={OFFER_PATH} className="btn-primary hidden whitespace-nowrap px-4 py-2.5 text-sm sm:inline-flex">
            Get My Cash Offer
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
