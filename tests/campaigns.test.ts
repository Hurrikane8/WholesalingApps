import { describe, expect, it } from "vitest";
import { campaignDestination, campaignProblems, campaignRedirects, campaigns, type Campaign } from "@/config/campaigns";
import { isFinalDomain } from "@/lib/env";
import { isPrintableSiteUrl } from "../scripts/qr.mjs";

const letter: Campaign = { code: "l1", label: "Letter", to: "/hello", utm: { source: "letter", medium: "direct_mail", campaign: "2026-10-letter" } };

describe("campaigns (spec 4.8)", () => {
  it("has valid, unique codes", () => expect(campaignProblems(campaigns)).toEqual([]));

  it("rejects bad and duplicate codes", () => {
    expect(campaignProblems([{ ...letter, code: "L1" }])).toHaveLength(1);
    expect(campaignProblems([{ ...letter, code: "x" }])).toHaveLength(1);
    expect(campaignProblems([{ ...letter, code: "abcdefghijklm" }])).toHaveLength(1);
    expect(campaignProblems([{ ...letter, code: "dh-1" }])).toHaveLength(1);
    expect(campaignProblems([letter, letter])).toEqual(['"l1" is used twice']);
    expect(campaignProblems([{ ...letter, to: "https://elsewhere.test" }])).toHaveLength(1);
  });

  it("builds temporary /go redirects with UTM parameters", () => {
    expect(campaignDestination(letter)).toBe("/hello?utm_source=letter&utm_medium=direct_mail&utm_campaign=2026-10-letter");
    expect(campaignDestination({ ...letter, utm: { ...letter.utm, content: "blue" } })).toContain("utm_content=blue");
    expect(campaignRedirects([letter])).toEqual([{ source: "/go/l1", destination: campaignDestination(letter), permanent: false }]);
  });

  it("prints QR codes only for the real https domain", () => {
    for (const url of ["https://www.aurorahomebuyers.ca", "https://aurorahomebuyers.com"]) {
      expect(isPrintableSiteUrl(url)).toBe(true);
      expect(isFinalDomain(url)).toBe(true);
    }
    for (const url of ["http://www.aurorahomebuyers.ca", "https://wholesaling-apps.vercel.app", "https://example.com", "http://localhost:3000", ""]) {
      expect(isPrintableSiteUrl(url)).toBe(false);
    }
    // Same host rules as isFinalDomain.
    for (const url of ["https://a.netlify.app", "https://a.pages.dev", "https://a.onrender.com", "https://www.example.com"]) {
      expect(isPrintableSiteUrl(url)).toBe(isFinalDomain(url));
    }
  });
});
