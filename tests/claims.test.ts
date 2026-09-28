import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { site, type VerifiedFlag } from "@/config/site";
import {
  closeInDaysTitle,
  closingPhrase,
  COMBINED_COST_LABEL,
  founderDisplayName,
  heroHeadline,
  isShown,
  isUnconfirmed,
  isVerified,
  legalFeesSentence,
  offerMathClause,
  offerOpenSentence,
  offerTimingPhrase,
  promiseItems,
  responseLine,
  sampleOfferRows,
  siteDescription,
} from "@/lib/claims";
import { FORBIDDEN_PLACEHOLDERS, fillPlaceholders, renderMarkdown } from "@/lib/content";
import { getFaqs } from "@/content/faqs";
import { getComparisonRows } from "@/content/comparison";
import { samples } from "@/content/samples";
import { placeholderWarnings } from "@/lib/launch";
import { BANNED_PHRASES, findBanned, findUnverifiedPromises } from "./banned-phrases.mjs";
import { readVerifiedFlags } from "../scripts/lib/verified-flags.mjs";

const FLAGS = Object.keys(site.verified) as VerifiedFlag[];
const original = { ...site.verified };
const mutableFlags = site.verified as Record<VerifiedFlag, boolean>;
const mutableFounder = site.founder as { lastName: string };
const mutableResponse = site.responsePromise as { duringHours: string };
const mutableSite = site as { offerStaysOpenDays: number | null };

function setFlags(value: boolean) {
  for (const flag of FLAGS) mutableFlags[flag] = value;
}

/** Everything claims.ts can put on a page, as one string. */
function allClaimsText(): string {
  const parts = [
    closingPhrase(),
    offerTimingPhrase(),
    offerMathClause(),
    closeInDaysTitle() ?? "",
    legalFeesSentence() ?? "",
    responseLine() ?? "",
    offerOpenSentence() ?? "",
    heroHeadline(),
    siteDescription(),
    ...promiseItems().flatMap((p) => [p.title, p.sentence]),
    ...sampleOfferRows(samples.house).map((r) => `${r.label} ${r.note ?? ""}`),
    ...getFaqs().flatMap((f) => [f.question, f.answer]),
    ...getComparisonRows().flatMap((r) => [r.label, r.us, r.listing]),
  ];
  // "¦" marks a boundary, as scan-build does between HTML blocks.
  return parts.join(" ¦ ");
}

beforeEach(() => {
  // Vitest runs with NODE_ENV=test, so deployEnv() is "development" unless a test stubs it.
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("SITE_ENV", "");
  vi.stubEnv("NEXT_PUBLIC_PREVIEW_UNCONFIRMED", "");
});

afterEach(() => {
  Object.assign(mutableFlags, original);
  mutableFounder.lastName = "";
  mutableResponse.duringHours = "";
  mutableSite.offerStaysOpenDays = null;
  vi.unstubAllEnvs();
});

describe("with every flag off", () => {
  beforeEach(() => setFlags(false));

  it("makes no specific promise", () => {
    expect(closingPhrase()).toBe("on the date you choose");
    expect(offerTimingPhrase()).toBe("after I see the place");
    expect(offerMathClause()).toBe("");
    expect(closeInDaysTitle()).toBeNull();
    expect(legalFeesSentence()).toBeNull();
    expect(promiseItems()).toEqual([]);
    expect(heroHeadline()).toBe(`Sell your ${site.market.name} home as-is, to a real person.`);
    expect(siteDescription()).toBe(`Sell your ${site.market.name} house, townhouse or condo as-is to a local buyer. No repairs, no showings and no agent commission.`);
  });

  it("combines costs and profit into one sample row", () => {
    const rows = sampleOfferRows(samples.house);
    expect(rows.some((r) => r.kind === "profit")).toBe(false);
    expect(rows.at(-1)).toMatchObject({ label: COMBINED_COST_LABEL, amount: -79_100 });
    expect(sampleOfferRows(samples.condo).at(-1)).toMatchObject({ label: COMBINED_COST_LABEL, amount: -53_250 });
  });

  it("puts no unverified promise in any claims output, FAQ or comparison row", () => {
    const text = allClaimsText();
    expect(findUnverifiedPromises(text, mutableFlags)).toEqual([]);
    expect(findBanned(text)).toEqual([]);
  });

  it("fills content placeholders with the neutral phrases and no tags", () => {
    expect(fillPlaceholders("We close {{closingPhrase}}.", { html: true })).toBe("We close on the date you choose.");
    expect(fillPlaceholders("Offer {{offerTimingPhrase}}. {{legalFeesSentence}}")).toBe("Offer after I see the place. ");
  });

  it("lists every unconfirmed flag as a launch warning", () => {
    const warnings = placeholderWarnings().join("\n");
    for (const flag of FLAGS) expect(warnings).toContain(flag);
  });
});

describe("with every flag on", () => {
  beforeEach(() => setFlags(true));

  it("makes the confirmed promises", () => {
    expect(closingPhrase()).toBe(`as soon as ${site.promises.closeInDays} days, or on the date you choose`);
    expect(offerTimingPhrase()).toBe(`within ${site.promises.offerWithinHours} hours of seeing the place`);
    expect(offerMathClause()).toBe(", with the math laid out");
    expect(closeInDaysTitle()).toBe(`Close in ${site.promises.closeInDays} days`);
    expect(legalFeesSentence()).toBe("I pay your standard legal fees.");
    expect(heroHeadline()).toBe(`Sell your ${site.market.name} home as-is. See the math first.`);
    expect(siteDescription()).toBe(
      `Sell your ${site.market.name} house, townhouse or condo as-is to a local buyer who shows you the math behind the offer and tells you when listing would net more.`,
    );
  });

  it("returns the four promise items in order, none unconfirmed", () => {
    const items = promiseItems();
    expect(items.map((i) => i.title)).toEqual(["You see the math", "You hear it when listing wins", "You know who's buying", "The price holds"]);
    expect(items.every((i) => !i.unconfirmed)).toBe(true);
    expect(items[0].sentence).toContain("my profit, line by line");
  });

  it("itemizes the profit line in samples", () => {
    expect(sampleOfferRows(samples.house)).toEqual(samples.house.rows);
  });
});

describe("the brand pillars as configured", () => {
  it("shows the three approved pillars and hides the rest", () => {
    Object.assign(mutableFlags, original);
    expect(promiseItems().map((i) => i.flag)).toEqual(
      (["explainsOfferMath", "tellsWhenListingWins", "assignmentDisclosedBeforeSigning", "noRetrades"] as const).filter((f) => original[f]),
    );
    expect(promiseItems()[0].sentence).toBe(
      original.showsMarginInWriting
        ? "Your written offer lists the after-repair value, the repairs, my costs and my profit, line by line."
        : "Your offer comes with the after-repair value, the repair estimate and my costs, so you can check my work.",
    );
  });
});

describe("preview mode", () => {
  beforeEach(() => setFlags(false));

  it("shows unconfirmed claims with a tag outside production", () => {
    vi.stubEnv("SITE_ENV", "preview");
    vi.stubEnv("NEXT_PUBLIC_PREVIEW_UNCONFIRMED", "true");
    expect(isVerified("closeInDays")).toBe(false);
    expect(isShown("closeInDays")).toBe(true);
    expect(isUnconfirmed("closeInDays")).toBe(true);
    expect(closingPhrase()).toContain(`${site.promises.closeInDays} days`);
    expect(promiseItems().every((i) => i.unconfirmed)).toBe(true);
    expect(fillPlaceholders("We close {{closingPhrase}}.", { html: true })).toContain('data-unconfirmed=""');
    expect(fillPlaceholders("We close {{closingPhrase}}.")).not.toContain("data-unconfirmed");
  });

  it("never shows unconfirmed claims in production, even with the switch on", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_PREVIEW_UNCONFIRMED", "true");
    expect(isShown("closeInDays")).toBe(false);
    expect(isUnconfirmed("closeInDays")).toBe(false);
    expect(closingPhrase()).toBe("on the date you choose");
    expect(promiseItems()).toEqual([]);
  });

  it("needs the switch as well as a non-production build", () => {
    vi.stubEnv("SITE_ENV", "preview");
    expect(isShown("closeInDays")).toBe(false);
  });
});

describe("other claims", () => {
  it("adds the founder's last name only when it's set", () => {
    expect(founderDisplayName()).toBe(site.founder.firstName);
    mutableFounder.lastName = "Example";
    expect(founderDisplayName()).toBe(`${site.founder.firstName} Example`);
  });

  it("promises a response time only when one is configured", () => {
    expect(responseLine()).toBeNull();
    mutableResponse.duringHours = "within 2 hours";
    expect(responseLine()).toBe(`I reply within 2 hours during business hours (${site.hours.label}).`);
  });

  it("says how long an offer stays open only when it's configured", () => {
    expect(offerOpenSentence()).toBeNull();
    mutableSite.offerStaysOpenDays = 5;
    expect(offerOpenSentence()).toBe("My offer stays open for 5 days, so you have time to think and get advice.");
  });
});

describe("scan-build's copy of the flags", () => {
  it("matches site.verified", () => expect(readVerifiedFlags()).toEqual(original));
});

/* ─── Repository scans ──────────────────────────────────────────────────── */

const ROOT = process.cwd();

function filesUnder(dir: string, exts: RegExp): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesUnder(full, exts));
    else if (exts.test(entry.name)) out.push(full);
  }
  return out;
}

const sourceFiles = [...filesUnder(path.join(ROOT, "src"), /\.(ts|tsx|css|md|json|svg)$/), ...filesUnder(path.join(ROOT, "content"), /\.md$/)];

describe("banned phrases (spec 2.3)", () => {
  it("keeps the list intact", () => expect(BANNED_PHRASES.length).toBeGreaterThanOrEqual(24));

  it("catches the phrases and patterns it should", () => {
    expect(findBanned("Get a Fair Cash Offer today")).not.toEqual([]);
    expect(findBanned("We’ve helped hundreds")).not.toEqual([]);
    expect(findBanned("I have bought many homes")).not.toEqual([]);
    expect(findBanned("We buy condos in Mill Woods all the time")).not.toEqual([]);
    expect(findBanned("a normal purchase for us")).not.toEqual([]);
    expect(findBanned("Red flag #1: no offer in writing")).not.toEqual([]);
    expect(findBanned("color: #1a2b3c; after I see the place")).toEqual([]);
    expect(findBanned('<a href="#1-after-repair-value">1. After-repair value</a> [ARV](#1-arv)')).toEqual([]);
    expect(findBanned("Edmonton's #1-rated cash buyer")).not.toEqual([]);
  });

  it.each(sourceFiles.map((f) => [path.relative(ROOT, f), f]))("%s has none", (_, file) => {
    expect(findBanned(fs.readFileSync(file, "utf8"))).toEqual([]);
  });
});

describe("placeholders (spec 6.3)", () => {
  const contentFiles = filesUnder(path.join(ROOT, "content"), /\.md$/);

  it.each(contentFiles.map((f) => [path.relative(ROOT, f), f]))("%s uses no removed placeholder", (_, file) => {
    const text = fs.readFileSync(file, "utf8");
    for (const key of FORBIDDEN_PLACEHOLDERS) expect(text).not.toMatch(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`));
  });

  it("refuses to render a removed placeholder", () => {
    expect(() => renderMarkdown("We close in {{closeDays}} days.")).toThrow(/closeDays/);
    expect(() => fillPlaceholders("Offer in {{offerHours}} hours")).toThrow(/offerHours/);
  });
});
