"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Menu, MessageSquare, Phone, X } from "lucide-react";
import { investorsNav, primaryNav, secondaryNav } from "@/config/nav";
import { buttonClass } from "@/components/ui/Button";

type Props = {
  /** The logo, rendered by the server component that includes the menu. */
  logo: ReactNode;
  phone: string;
  phoneHref: string;
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The mobile menu (spec 5.2): a full-width sheet. It traps focus while open,
 * closes on Escape and returns focus to the menu button.
 */
export function MobileMenu({ logo, phone, phoneHref }: Props) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef(true);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const button = buttonRef.current;
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      if (restoreFocus.current) button?.focus();
      restoreFocus.current = true;
    };
  }, [open]);

  const navigate = () => {
    restoreFocus.current = false;
    setOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex size-11 items-center justify-center rounded-button text-ink hover:bg-frost"
      >
        <Menu className="size-6" aria-hidden="true" />
        <span className="sr-only">Menu</span>
      </button>

      {open && (
        <div ref={panelRef} id={panelId} role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 overflow-y-auto bg-snow">
          <div className="page-wrap flex h-16 items-center justify-between border-b border-mist">
            <Link href="/" onClick={navigate} className="inline-flex min-h-11 shrink-0 items-center">
              {logo}
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-11 items-center justify-center rounded-button text-ink hover:bg-frost"
            >
              <X className="size-6" aria-hidden="true" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <MobileMenuLinks phone={phone} phoneHref={phoneHref} onNavigate={navigate} />
        </div>
      )}
    </>
  );
}

/** The sheet's contents; also rendered statically on /styleguide. */
export function MobileMenuLinks({ phone, phoneHref, onNavigate }: { phone: string; phoneHref: string; onNavigate?: () => void }) {
  const linkClass = "flex min-h-12 items-center font-display text-[1.25rem] font-bold text-ink hover:text-pine";
  return (
    <nav aria-label="Menu" className="page-wrap py-6">
      <ul>
        {primaryNav.map((item) => (
          <li key={item.href}>
            <Link href={item.href} onClick={onNavigate} className={linkClass}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <ul className="mt-4 border-t border-mist pt-4">
        {secondaryNav.map((item) => (
          <li key={item.href}>
            <Link href={item.href} onClick={onNavigate} className="flex min-h-11 items-center text-ink hover:text-pine">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-mist pt-4">
        <Link href={investorsNav.href} onClick={onNavigate} className="flex min-h-11 items-center text-ink hover:text-pine">
          {investorsNav.label}
        </Link>
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <a href={`tel:${phoneHref}`} className={buttonClass("secondary")} aria-label={`Call ${phone}`}>
          <Phone className="size-5" aria-hidden="true" />
          Call
        </a>
        <a href={`sms:${phoneHref}`} className={buttonClass("secondary")} aria-label={`Text ${phone}`}>
          <MessageSquare className="size-5" aria-hidden="true" />
          Text
        </a>
      </div>
    </nav>
  );
}
