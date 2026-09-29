/**
 * Every message the site sends (spec 4.6). Owner alerts carry the details
 * Kane needs to call back; the ntfy push carries no personal information;
 * seller messages identify the sender, say how to reach Kane and how to opt
 * out, and take every promise from claims.ts.
 */
import { phoneHref, site } from "@/config/site";
import { airtable } from "@/config/airtable";
import type { Buyer } from "@/lib/buyers";
import { consentRecord } from "@/lib/buyers";
import { offerMathClause, offerTimingPhrase } from "@/lib/claims";
import { escapeHtml } from "@/lib/delivery";
import { formatMoney } from "@/lib/format";
import type { Lead } from "@/lib/leads";
import { optionLabel } from "@/lib/leads";
import { CONDITIONS, FINANCING, OCCUPANCY, OPT_OUT_CHANNELS, PROPERTY_TYPES, STRATEGIES, TARGET_AREAS, TIMELINES, toE164 } from "@/lib/lead-options";
import type { OptOut } from "@/lib/optouts";
import { campaignParams, describeTouch, formatParams } from "@/lib/touch";
import type { Email } from "./resend";

type Rows = [string, string][];

const firstNameOf = (name: string) => name.trim().split(/\s+/)[0] || name.trim();
const streetOf = (address: string) => address.split(",")[0].trim();
const inEdmonton = (iso: string) =>
  new Date(iso).toLocaleString("en-CA", { timeZone: airtable.timeZone, dateStyle: "medium", timeStyle: "short" });
const siteDomain = () => {
  try {
    return new URL(site.url).host.replace(/^www\./, "");
  } catch {
    return site.url;
  }
};

/** "within 2 hours" when Kane has set a reply time, otherwise "soon". */
export function callWindow(): string {
  return site.responsePromise.duringHours.trim() || "soon";
}

/* ─── Shared HTML ───────────────────────────────────────────────────────── */

const FONT = "font-family:Arial,Helvetica,sans-serif";

function rowsTable(rows: Rows): string {
  return `<table cellpadding="6" style="${FONT};font-size:15px;border-collapse:collapse">
${rows
  .filter(([, v]) => v)
  .map(
    ([k, v]) =>
      `<tr><td style="color:#3F5A54;border-bottom:1px solid #C9D6D9;vertical-align:top;white-space:nowrap"><strong>${escapeHtml(k)}</strong></td><td style="color:#183A31;border-bottom:1px solid #C9D6D9">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`,
  )
  .join("\n")}
</table>`;
}

const rowsText = (rows: Rows) =>
  rows
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

function bigLink(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;margin:4px 8px 4px 0;padding:14px 20px;border-radius:10px;background:#0B6B4F;color:#FFFFFF;${FONT};font-size:18px;font-weight:bold;text-decoration:none">${escapeHtml(label)}</a>`;
}

/* ─── Seller leads ──────────────────────────────────────────────────────── */

const labelOf = {
  type: (lead: Lead) => (lead.propertyType ? optionLabel(PROPERTY_TYPES, lead.propertyType) : ""),
  timeline: (lead: Lead) => (lead.timeline ? optionLabel(TIMELINES, lead.timeline) : ""),
};

/** The body of Kane's quick-reply text, prefilled by the sms: link in the alert. */
export function quickReplyText(lead: Lead): string {
  return `Hi ${firstNameOf(lead.name)}, it's ${site.founder.firstName} from ${site.name}. I got your request about ${streetOf(lead.address)}. Is now a good time for a quick call?`;
}

export function ownerAlertEmail(lead: Lead): Email {
  const first = firstNameOf(lead.name);
  const timeline = labelOf.timeline(lead);
  const phone = toE164(lead.phone) ?? lead.phone;
  const campaign = campaignParams(lead);
  const rows: Rows = [
    ["Address", lead.address],
    ["Property type", labelOf.type(lead)],
    ["Timeline", timeline],
    ["Condition", lead.condition && optionLabel(CONDITIONS, lead.condition)],
    ["Occupancy", lead.occupancy && optionLabel(OCCUPANCY, lead.occupancy)],
    ["Reason", lead.reason],
    ["Notes", lead.notes],
    ["Email", lead.email],
    ["OK to text", lead.smsConsent ? "Yes, ticked the consent box" : "No"],
    ["Source and campaign", [Object.keys(campaign).length ? formatParams(campaign) : "", lead.referrer && `referrer ${lead.referrer}`].filter(Boolean).join("; ")],
    ["Landing page", lead.firstTouch?.landingPage || lead.page],
    ["Submitted from", lead.page],
    ["First touch", describeTouch("", lead.firstTouch).replace(/^: /, "")],
    ["Lead ID", lead.id],
    ["Submitted", `${inEdmonton(lead.receivedAt)} (Edmonton time)`],
  ];

  const actions = [
    bigLink(`tel:${phone}`, `Call ${first}`),
    lead.smsConsent && bigLink(`sms:${phone}?body=${encodeURIComponent(quickReplyText(lead))}`, `Text ${first}`),
  ]
    .filter(Boolean)
    .join("");
  const noConsent = lead.smsConsent ? "" : `<p style="${FONT};font-size:15px;color:#B3261E;margin:0 0 16px"><strong>No text consent. Call instead.</strong></p>\n`;

  const html = `<p style="${FONT};font-size:20px;color:#183A31;margin:0 0 12px"><strong>${escapeHtml(lead.name)}, ${escapeHtml(lead.phone)}</strong></p>
<p style="margin:0 0 16px">${actions}</p>
${noConsent}${rowsTable(rows)}`;

  const text = [
    `${lead.name}, ${lead.phone}`,
    `Call ${first}: tel:${phone}`,
    lead.smsConsent ? `Text ${first}: sms:${phone}` : "No text consent. Call instead.",
    "",
    rowsText(rows),
  ].join("\n");

  return { subject: `New lead: ${lead.address}${timeline ? ` (${timeline})` : ""}`, html, text };
}

/** Kane's text through Quo: 320 characters or fewer. */
export function ownerText(lead: Lead): string {
  const type = labelOf.type(lead) || "Type not given";
  const timeline = labelOf.timeline(lead) || "no timeline given";
  const tail = ` ${lead.name} ${lead.phone}. ${type}, ${timeline}. OK to text: ${lead.smsConsent ? "Yes" : "No"}.`;
  const room = 320 - "New lead: .".length - tail.length;
  const address = lead.address.length > room ? `${lead.address.slice(0, Math.max(0, room - 1))}…` : lead.address;
  return `New lead: ${address}.${tail}`.slice(0, 320);
}

/** The ntfy push: no name, phone, email or address. */
export function ownerPush(lead: Lead): { title: string; body: string; priority: "high" | "default"; tags: string } {
  const type = labelOf.type(lead) || "Property type not given";
  const timeline = labelOf.timeline(lead) || "no timeline given";
  return {
    title: "New seller lead",
    body: `${type}, ${timeline}. Details are in your email.`,
    priority: lead.timeline === "ASAP" ? "high" : "default",
    tags: "house",
  };
}

export function sellerText(lead: Lead): string {
  return `Hi ${firstNameOf(lead.name)}, it's ${site.founder.firstName} from ${site.name}. I got your request about ${streetOf(lead.address)}. I'll call you ${callWindow()} from this number. Reply STOP to opt out.`;
}

export function sellerEmail(lead: Lead): Email {
  const first = firstNameOf(lead.name);
  const howItWorks = `${site.url}/how-it-works`;
  const text = `Hi ${first},

Thanks for telling me about ${lead.address}. I'll call you ${callWindow()} from ${site.phone}. Save the number so you know it's me.

Here's what happens next:
1. We talk about the place and what's going on.
2. I see it in person, or we do a video walkthrough.
3. You get a written offer ${offerTimingPhrase()}${offerMathClause()}. There's no obligation to take it.

If you'd like to see how I work out an offer first: ${howItWorks}

${site.founder.firstName}
${site.name}
${site.market.name}, ${site.market.province}
${site.phone}

You're getting this because you asked for an offer at ${siteDomain()}. If you'd rather not hear from me, reply "stop" and I won't contact you again.`;

  const p = (s: string) => `<p style="${FONT};font-size:16px;line-height:1.5;color:#183A31;margin:0 0 14px">${s}</p>`;
  const html = [
    p(`Hi ${escapeHtml(first)},`),
    p(
      `Thanks for telling me about ${escapeHtml(lead.address)}. I'll call you ${escapeHtml(callWindow())} from <a href="tel:${phoneHref}" style="color:#183A31">${escapeHtml(site.phone)}</a>. Save the number so you know it's me.`,
    ),
    p("Here's what happens next:"),
    `<ol style="${FONT};font-size:16px;line-height:1.5;color:#183A31;margin:0 0 14px;padding-left:22px">
<li>We talk about the place and what's going on.</li>
<li>I see it in person, or we do a video walkthrough.</li>
<li>You get a written offer ${escapeHtml(offerTimingPhrase())}${escapeHtml(offerMathClause())}. There's no obligation to take it.</li>
</ol>`,
    p(`If you'd like to see how I work out an offer first: <a href="${escapeHtml(howItWorks)}" style="color:#183A31">${escapeHtml(howItWorks)}</a>`),
    p(`${escapeHtml(site.founder.firstName)}<br>${escapeHtml(site.name)}<br>${escapeHtml(site.market.name)}, ${escapeHtml(site.market.province)}<br>${escapeHtml(site.phone)}`),
    `<p style="${FONT};font-size:14px;line-height:1.5;color:#3F5A54;margin:24px 0 0">You're getting this because you asked for an offer at ${escapeHtml(siteDomain())}. If you'd rather not hear from me, reply "stop" and I won't contact you again.</p>`,
  ].join("\n");

  return { subject: `Got your request, ${first}`, html, text };
}

/* ─── Buyers list ───────────────────────────────────────────────────────── */

const labels = (options: readonly { value: string; label: string }[], selected: string[]) =>
  selected.map((v) => optionLabel(options, v)).join(", ");
const money = (n?: number) => (typeof n === "number" ? formatMoney(n) : "");

export function buyerAlertEmail(b: Buyer): Email {
  const rows: Rows = [
    ["Name", b.name],
    ["Company", b.company],
    ["Phone", b.phone],
    ["Email", b.email],
    ["Strategy", labels(STRATEGIES, b.strategies)],
    ["Property types", labels(PROPERTY_TYPES, b.propertyTypes)],
    ["Target areas", labels(TARGET_AREAS, b.targetAreas)],
    ["Financing", labels(FINANCING, b.financing)],
    ["Max purchase price", money(b.maxPrice)],
    ["Max reno budget", money(b.maxReno)],
    ["Max condo fee", money(b.maxCondoFee)],
    ["Proof of funds available", b.proofOfFunds ? "Yes (claimed)" : "Not stated"],
    ["Deals bought last 12 months", b.dealsLast12Months === undefined ? "" : String(b.dealsLast12Months)],
    ["Notes", b.notes],
    ["Consent", consentRecord(b)],
    ["Signup ID", b.id],
  ];
  return {
    subject: `New buyer signup: ${b.name}`,
    html: `<p style="${FONT};font-size:18px;color:#183A31"><strong>New buyers list signup</strong></p>\n${rowsTable(rows)}`,
    text: rowsText(rows),
  };
}

/* ─── Opt-outs ──────────────────────────────────────────────────────────── */

export function optOutAlertEmail(o: OptOut): Email {
  const rows: Rows = [
    ["Address", o.address],
    ["Name", o.name],
    ["Phone", o.phone],
    ["Email", o.email],
    ["How I reached them", o.channel && optionLabel(OPT_OUT_CHANNELS, o.channel)],
    ["Note", o.notes],
    ["First touch", describeTouch("", o.firstTouch).replace(/^: /, "")],
    ["Received", `${inEdmonton(o.receivedAt)} (Edmonton time)`],
    ["Opt-out ID", o.id],
  ];
  const intro = "Take this address off your mailing, door-knocking and calling lists. CASL allows up to 10 business days; sooner is better.";
  return {
    subject: `Opt-out: ${o.address}`,
    html: `<p style="${FONT};font-size:16px;color:#183A31">${escapeHtml(intro)}</p>\n${rowsTable(rows)}`,
    text: `${intro}\n\n${rowsText(rows)}`,
  };
}
