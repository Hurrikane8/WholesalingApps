import Link from "next/link";
import { MessageSquare, Phone } from "lucide-react";
import { phoneHref } from "@/config/site";
import { OFFER_PATH } from "@/config/nav";

/** Sticky call / text / offer bar on phones, where most sellers find you. */
export function MobileCtaBar() {
  return (
    <div data-legacy-chrome="" className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-[auto_auto_1fr] gap-2">
        <a href={`tel:${phoneHref}`} className="btn-secondary px-4 py-2.5 text-sm" aria-label="Call us">
          <Phone className="size-4" aria-hidden="true" />
          Call
        </a>
        <a href={`sms:${phoneHref}`} className="btn-secondary px-4 py-2.5 text-sm" aria-label="Text us">
          <MessageSquare className="size-4" aria-hidden="true" />
          Text
        </a>
        <Link href={OFFER_PATH} className="btn-primary px-4 py-2.5 text-sm">
          Get My Cash Offer
        </Link>
      </div>
    </div>
  );
}
