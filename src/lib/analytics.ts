/**
 * Sends a conversion/analytics event to whichever tags are installed
 * (Google Tag Manager's dataLayer and/or GA4's gtag). Safe to call anywhere
 * on the client; it does nothing when no analytics are configured.
 */
type Params = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** A coarse page type for event parameters: never a URL with personal details in it. */
export function pageType(pathname: string): string {
  if (pathname === "/") return "home";
  const [first] = pathname.split("/").filter(Boolean);
  const types: Record<string, string> = {
    "get-cash-offer": "offer",
    "how-it-works": "how_it_works",
    "what-we-buy": "property_type",
    situations: "situation",
    "we-buy-houses": "area",
    blog: "guide",
    "cash-offer-vs-realtor": "comparison",
    hello: "hello",
    about: "about",
    contact: "contact",
    faq: "faq",
    investors: "investors",
  };
  return types[first] ?? "other";
}

export function trackEvent(event: string, params: Params = {}): void {
  if (typeof window === "undefined") return;
  try {
    if (window.gtag) window.gtag("event", event, params);
    else if (window.dataLayer) window.dataLayer.push({ event, ...params });
  } catch {
    // Analytics must never break the form.
  }
}
