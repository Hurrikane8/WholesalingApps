"use client";

import { useEffect } from "react";
import { pageType, trackEvent } from "@/lib/analytics";

/**
 * Tracks call, text and other marked clicks site-wide with one delegated
 * listener (spec 8.1): `phone_click` for tel: links, `sms_click` for sms:
 * links, and the event named in `data-track` for anything else (for example
 * the booking link). `location` is the nearest `data-track-location`, else
 * header, footer or body. No personal information is ever sent.
 */
export function ClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const el = target?.closest('a[href^="tel:"], a[href^="sms:"], [data-track]');
      if (!el) return;
      const location =
        el.closest("[data-track-location]")?.getAttribute("data-track-location") ??
        (el.closest("header") ? "header" : el.closest("footer") ? "footer" : "body");
      const params = { location, page_type: pageType(window.location.pathname) };
      const named = el.getAttribute("data-track");
      if (named) {
        trackEvent(named, params);
        return;
      }
      trackEvent(el.getAttribute("href")?.startsWith("tel:") ? "phone_click" : "sms_click", params);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
