import { describe, expect, it } from "vitest";
import { EXAMPLE, breakEven, cashSale, commission, listAsIs, netSheet, parseAmount, repairAndList } from "@/lib/net-sheet";

describe("net sheet with the example defaults (spec 5.8)", () => {
  it("repair-and-list nets 321,700", () => expect(repairAndList(EXAMPLE).net).toBe(321_700));
  it("list as-is nets 299,947", () => expect(listAsIs(EXAMPLE).net).toBe(299_947));
  it("a 265,000 cash offer nets 262,400 when legal fees aren't covered", () => expect(cashSale(EXAMPLE, 265_000, false).net).toBe(262_400));
  it("and 263,900 when they are", () => expect(cashSale(EXAMPLE, 265_000, true).net).toBe(263_900));
  it("breaks even at 302,547 when legal fees aren't covered", () => expect(breakEven(EXAMPLE, false)).toBe(302_547));
  it("breaks even 1,500 lower when they are", () => expect(breakEven(EXAMPLE, true)).toBe(301_047));
});

describe("commission", () => {
  it("uses 7% of the first $100,000 and 3% of the rest, plus GST", () => {
    expect(commission(400_000, { kind: "structure" })).toBe(16_800);
    expect(commission(80_000, { kind: "structure" })).toBe(5_880);
  });

  it("supports a flat rate, with and without GST", () => {
    expect(commission(400_000, { kind: "flat", rate: 4, gst: true })).toBe(16_800);
    expect(commission(400_000, { kind: "flat", rate: 4, gst: false })).toBe(16_000);
    expect(commission(400_000, { kind: "flat", rate: -1, gst: false })).toBe(0);
  });

  it("is zero on a zero price", () => expect(commission(0, { kind: "structure" })).toBe(0));
});

describe("netSheet", () => {
  it("leaves the cash path out without an offer", () => {
    expect(netSheet({ ...EXAMPLE, cashOffer: undefined }, false).cash).toBeUndefined();
    expect(netSheet({ ...EXAMPLE, cashOffer: 0 }, false).cash).toBeUndefined();
  });

  it("includes it with one", () => {
    expect(netSheet(EXAMPLE, false).cash?.net).toBe(262_400);
    expect(netSheet(EXAMPLE, false).repairList.months).toBe(5);
  });
});

describe("parseAmount", () => {
  it.each([
    ["$350,000", 350_000],
    ["350000", 350_000],
    [" 2,200 ", 2_200],
    ["0", 0],
  ])("reads %s", (input, expected) => expect(parseAmount(input)).toBe(expected));

  it.each(["", "   ", "abc", "-5", "12abc"])("rejects %s", (input) => expect(parseAmount(input)).toBeUndefined());
});
