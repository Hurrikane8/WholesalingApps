import type { Metadata } from "next";
import { OFFER_PATH } from "@/config/nav";
import { phoneHref, site } from "@/config/site";
import { SiteShell } from "@/components/chrome/Shell";
import { ButtonLink } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

/**
 * The 404 (spec 5.19). The root not-found renders inside the root layout only,
 * outside the route groups, so it brings its own site chrome.
 */
export default function NotFound() {
  return (
    <SiteShell>
      <div className="page-wrap py-16 text-center lg:py-24">
        <h1 className="type-h1">That page isn&apos;t here.</h1>
        <p className="type-lead mx-auto mt-5 max-w-[40ch] text-ink-2">It may have moved. Try one of these, or call me.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href={OFFER_PATH}>Get my offer</ButtonLink>
          <ButtonLink href="/how-it-works" variant="secondary">
            How it works
          </ButtonLink>
        </div>
        <p className="mt-6">
          <TextLink href="/" className="inline-flex min-h-11 items-center">
            Home page
          </TextLink>
        </p>
        <p className="mt-2 text-ink-2">
          Call or text{" "}
          <TextLink href={`tel:${phoneHref}`} className="nums font-semibold">
            {site.phone}
          </TextLink>
          .
        </p>
      </div>
    </SiteShell>
  );
}
