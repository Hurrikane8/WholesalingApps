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

export function trackEvent(event: string, params: Params = {}): void {
  if (typeof window === "undefined") return;
  try {
    if (window.gtag) window.gtag("event", event, params);
    else if (window.dataLayer) window.dataLayer.push({ event, ...params });
  } catch {
    // Analytics must never break the form.
  }
}
