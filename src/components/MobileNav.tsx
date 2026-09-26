"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { OFFER_PATH, mainNav, mobileExtraNav } from "@/config/nav";
import { phoneHref, site } from "@/config/site";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="-mr-2 inline-flex size-11 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
      >
        {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="absolute inset-x-0 top-full border-b border-slate-200 bg-white shadow-lg"
        >
          <ul className="container-page flex flex-col py-3">
            {[...mainNav, ...mobileExtraNav].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="block rounded-md px-2 py-3 text-base font-medium text-slate-800 hover:bg-slate-50"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <a href={`tel:${phoneHref}`} className="btn-secondary px-3 text-sm">
                <Phone className="size-4" aria-hidden="true" />
                Call {site.phone}
              </a>
              <Link href={OFFER_PATH} onClick={close} className="btn-primary px-3 text-sm">
                Get My Offer
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
