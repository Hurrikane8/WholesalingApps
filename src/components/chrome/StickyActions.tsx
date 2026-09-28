"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { MessageSquare, Phone } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";

type Props = {
  phone: string;
  phoneHref: string;
  /** Where "Get my offer" goes when the page has no lead form. */
  offerHref: string;
  /** Focus layout: Call and Text only. */
  focus?: boolean;
  /** Render in place (for /styleguide) instead of fixed to the bottom. */
  demo?: boolean;
};

const FIELDS = "input:not([type=hidden]), select, textarea";

/**
 * The sticky actions bar below 1024px (spec 5.2): Call, Text, Get my offer.
 * It hides whenever a lead form ([data-lead-form]) is in view or focus is
 * inside a form. "Get my offer" scrolls to the nearest lead form and focuses
 * its first empty field; with no form on the page it's a plain link.
 * Pages reserve bottom padding for it (the root layout), so it never covers content.
 */
export function StickyActions({ phone, phoneHref, offerHref, focus = false, demo = false }: Props) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (demo) return;
    const visible = new Set<Element>();
    let focusInForm = false;
    const update = () => setHidden(visible.size > 0 || focusInForm);

    const forms = Array.from(document.querySelectorAll<HTMLElement>("[data-lead-form]"));
    const observer = forms.length
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) visible.add(entry.target);
              else visible.delete(entry.target);
            }
            update();
          },
          { threshold: 0.1 },
        )
      : null;
    forms.forEach((form) => observer?.observe(form));

    const onFocusChange = () => {
      focusInForm = Boolean(document.activeElement?.closest("form"));
      update();
    };
    // On focusout, activeElement is still the old element; check on the next frame.
    const onFocusOut = () => requestAnimationFrame(onFocusChange);
    document.addEventListener("focusin", onFocusChange);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      observer?.disconnect();
      document.removeEventListener("focusin", onFocusChange);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, [demo]);

  const goToForm = (event: MouseEvent<HTMLAnchorElement>) => {
    const forms = Array.from(document.querySelectorAll<HTMLElement>("[data-lead-form]"));
    if (forms.length === 0) return; // no form here: follow the link
    event.preventDefault();
    const nearest = forms
      .map((form) => ({ form, distance: Math.abs(form.getBoundingClientRect().top) }))
      .sort((a, b) => a.distance - b.distance)[0].form;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    nearest.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    const fields = Array.from(nearest.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(FIELDS)).filter(
      (el) => !el.disabled && el.tabIndex >= 0 && !el.closest("[aria-hidden='true']"),
    );
    const target = fields.find((el) => !el.value) ?? fields[0];
    target?.focus({ preventScroll: true });
  };

  const position = demo ? "relative" : "fixed inset-x-0 bottom-0 z-40 lg:hidden";
  return (
    <div
      data-hidden={hidden ? "" : undefined}
      className={`${position} border-t border-mist bg-snow/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur transition duration-150 data-hidden:invisible data-hidden:translate-y-full data-hidden:opacity-0`}
    >
      <div className={`mx-auto grid max-w-md gap-2 ${focus ? "grid-cols-2" : "grid-cols-[auto_auto_1fr]"}`}>
        <a href={`tel:${phoneHref}`} className={buttonClass("secondary", { compact: true })} aria-label={`Call ${phone}`}>
          <Phone className="size-5" aria-hidden="true" />
          Call
        </a>
        <a href={`sms:${phoneHref}`} className={buttonClass("secondary", { compact: true })} aria-label={`Text ${phone}`}>
          <MessageSquare className="size-5" aria-hidden="true" />
          Text
        </a>
        {!focus && (
          <a href={offerHref} onClick={goToForm} className={buttonClass("primary", { compact: true })}>
            Get my offer
          </a>
        )}
      </div>
    </div>
  );
}
