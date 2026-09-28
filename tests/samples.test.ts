import { afterEach, describe, expect, it } from "vitest";
import { site, type VerifiedFlag } from "@/config/site";
import { COMBINED_COST_LABEL, sampleOfferRows } from "@/lib/claims";
import { SAMPLE_CAPTION, samples } from "@/content/samples";

const flags = site.verified as Record<VerifiedFlag, boolean>;
const original = flags.showsMarginInWriting;
afterEach(() => {
  flags.showsMarginInWriting = original;
});

const sum = (amounts: number[]) => amounts.reduce((a, b) => a + b, 0);

describe("sample offers (spec 5.3)", () => {
  it.each(Object.values(samples).map((s) => [s.id, s]))("%s adds up to its offer", (_, sample) => {
    expect(sum(sample.rows.map((r) => r.amount))).toBe(sample.offer);
    expect(sample.rows[0].kind).toBe("value");
    expect(sample.rows.slice(1).every((r) => r.amount < 0)).toBe(true);
  });

  it("matches the figures in the brief", () => {
    expect(samples.house.offer).toBe(283_900);
    expect(samples.condo.offer).toBe(169_750);
  });

  it.each(Object.values(samples).map((s) => [s.id, s]))("%s: the combined row equals the sum of its parts", (_, sample) => {
    flags.showsMarginInWriting = false;
    const parts = sample.rows.filter((r) => r.kind === "cost" || r.kind === "profit");
    const combined = sampleOfferRows(sample).find((r) => r.label === COMBINED_COST_LABEL);
    expect(combined?.amount).toBe(sum(parts.map((r) => r.amount)));
    expect(sum(sampleOfferRows(sample).map((r) => r.amount))).toBe(sample.offer);
  });

  it("combines to the totals in the brief", () => {
    flags.showsMarginInWriting = false;
    expect(sampleOfferRows(samples.house).at(-1)?.amount).toBe(-79_100);
    expect(sampleOfferRows(samples.condo).at(-1)?.amount).toBe(-53_250);
  });

  it("labels the samples as illustrative", () => {
    expect(SAMPLE_CAPTION).toBe("Illustrative numbers, not a real property.");
  });
});
