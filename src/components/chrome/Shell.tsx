import type { ReactNode } from "react";
import { OFFER_PATH } from "@/config/nav";
import { phoneHref, site } from "@/config/site";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { FocusFooter, FocusHeader, SiteFooter } from "@/components/chrome/SiteFooter";
import { StickyActions } from "@/components/chrome/StickyActions";

/**
 * Page chrome (spec 5.2). Below 1024px the sticky actions bar is fixed to the
 * bottom, so the page always reserves room for it and it never covers content.
 */
const reserve = "flex min-h-screen flex-col pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:pb-0";

/** Every page except the focus pages: header, footer and Call / Text / Get my offer. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className={reserve}>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <StickyActions phone={site.phone} phoneHref={phoneHref} offerHref={OFFER_PATH} />
    </div>
  );
}

/** /get-cash-offer and /hello: logo and phone only, a slim footer, and Call / Text. */
export function FocusShell({ children }: { children: ReactNode }) {
  return (
    <div className={reserve}>
      <FocusHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <FocusFooter />
      <StickyActions phone={site.phone} phoneHref={phoneHref} offerHref={OFFER_PATH} focus />
    </div>
  );
}
