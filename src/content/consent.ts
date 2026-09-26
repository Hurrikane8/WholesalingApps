import { site } from "@/config/site";

/**
 * Consent wording for the investor buyers list. The exact text is stored with
 * each signup in Airtable, so you can prove express consent under CASL
 * (Canada's Anti-Spam Legislation) if ever asked.
 */
export const BUYER_CONSENT_TEXT = `Yes, I want to receive off-market property deals and investor updates from ${site.name} by email and text message. I can unsubscribe at any time by clicking "unsubscribe" or replying STOP. Message and data rates may apply. Contact: ${site.phone}.`;
