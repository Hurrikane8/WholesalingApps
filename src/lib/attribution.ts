/** Client-side helpers shared by the website's forms. */

const ATTRIBUTION_KEY = "lead_attribution";
const TRACKED_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "msclkid"];

/** First-touch campaign attribution, remembered for the browser session so it survives page navigation. */
export function readAttribution(): Record<string, string> {
  const fromUrl: Record<string, string> = {};
  const params = new URLSearchParams(window.location.search);
  for (const key of TRACKED_PARAMS) {
    const value = params.get(key);
    if (value) fromUrl[key] = value.slice(0, 200);
  }
  try {
    if (Object.keys(fromUrl).length) {
      sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(fromUrl));
      return fromUrl;
    }
    return JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY) ?? "{}");
  } catch {
    return fromUrl;
  }
}
