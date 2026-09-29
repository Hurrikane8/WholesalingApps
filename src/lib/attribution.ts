/**
 * Browser-side attribution (spec 8.2), sent with seller leads and opt-outs:
 *
 *   - first touch: campaign parameters, landing page, referrer and time from
 *     the visitor's first visit, kept 30 days in localStorage;
 *   - last touch: the same for this visit (sessionStorage), replaced whenever
 *     a new campaign link is followed.
 *
 * Storage can be blocked or full, so every access is wrapped in try/catch.
 * The server side (schema, formatting) is src/lib/touch.ts.
 */

export type Touch = { params: Record<string, string>; landingPage: string; referrer: string; at: string };

const FIRST_KEY = "aurora_first_touch";
const LAST_KEY = "aurora_last_touch";
const FIRST_TOUCH_DAYS = 30;
const TRACKED_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "msclkid"];

function currentTouch(): Touch {
  const params: Record<string, string> = {};
  const search = new URLSearchParams(window.location.search);
  for (const key of TRACKED_PARAMS) {
    const value = search.get(key);
    if (value) params[key] = value.slice(0, 200);
  }
  let referrer = "";
  try {
    // Only other sites count as a referrer.
    if (document.referrer && new URL(document.referrer).host !== window.location.host) referrer = document.referrer.slice(0, 500);
  } catch {
    // an unparseable referrer is no referrer
  }
  return { params, landingPage: window.location.pathname.slice(0, 300), referrer, at: new Date().toISOString() };
}

function read(storage: Storage, key: string): Touch | undefined {
  try {
    const value = JSON.parse(storage.getItem(key) ?? "null") as Touch | null;
    return value && typeof value === "object" && typeof value.at === "string" ? value : undefined;
  } catch {
    return undefined;
  }
}

function write(storage: Storage, key: string, touch: Touch): void {
  try {
    storage.setItem(key, JSON.stringify(touch));
  } catch {
    // storage blocked or full: attribution is nice to have, never required
  }
}

/**
 * Records this page view's touch. Call once per page load (AttributionCapture
 * in the root layout does); forms call it again before sending, which is harmless.
 */
export function captureAttribution(): { firstTouch?: Touch; lastTouch?: Touch } {
  if (typeof window === "undefined") return {};
  const touch = currentTouch();
  const hasCampaign = Object.keys(touch.params).length > 0;

  let first: Touch | undefined;
  let last: Touch | undefined;
  try {
    first = read(localStorage, FIRST_KEY);
    const expired = first && Date.now() - Date.parse(first.at) > FIRST_TOUCH_DAYS * 24 * 60 * 60 * 1000;
    if (!first || expired) {
      first = touch;
      write(localStorage, FIRST_KEY, first);
    }
  } catch {
    first = touch;
  }
  try {
    last = read(sessionStorage, LAST_KEY);
    if (!last || hasCampaign) {
      last = touch;
      write(sessionStorage, LAST_KEY, last);
    }
  } catch {
    last = touch;
  }
  return { firstTouch: first, lastTouch: last };
}

/** Last-touch campaign parameters, for forms that only send `utm` (the buyers list). */
export function readAttribution(): Record<string, string> {
  return captureAttribution().lastTouch?.params ?? {};
}
