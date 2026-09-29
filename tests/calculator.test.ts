import { describe, expect, it } from "vitest";
import { compared, months, summaryText, validate } from "@/components/calculator/copy";
import { EXAMPLE, netSheet } from "@/lib/net-sheet";

describe("calculator validation", () => {
  it("accepts the example's formatted amounts", () => {
    expect(validate("arv", "400,000")).toBeUndefined();
    expect(validate("monthly", "$2,200")).toBeUndefined();
    expect(validate("monthsAsIs", "4")).toBeUndefined();
    expect(validate("rate", "4.5")).toBeUndefined();
  });

  it("leaves the cash offer optional", () => expect(validate("cashOffer", "  ")).toBeUndefined());

  it.each([
    ["arv", "", "Enter an amount, like 350,000"],
    ["repairs", "lots", "Enter an amount, like 350,000"],
    ["legal", "-5", "Enter an amount, like 350,000"],
    ["monthsRepairList", "", "Enter a number of months, like 4"],
    ["monthsAsIs", "61", "Enter up to 60 months"],
    ["rate", "25", "Enter a rate between 0 and 20"],
    ["cashOffer", "abc", "Enter an amount, like 350,000"],
  ] as const)("rejects %s = %j", (key, raw, message) => expect(validate(key, raw)).toBe(message));
});

describe("calculator sentences", () => {
  it("gives the break-even when there's no cash offer", () => {
    const sheet = netSheet({ ...EXAMPLE, cashOffer: undefined }, false);
    expect(summaryText(sheet.repairList, sheet.asIs, sheet.cash, sheet.breakEven)).toBe(
      "Repairing and listing nets about $321,700; listing as-is, about $299,947. In this scenario, a cash offer above $302,547 would beat listing as-is.",
    );
  });

  it("compares an offer with each listing path in words", () => {
    const sheet = netSheet(EXAMPLE, false);
    expect(summaryText(sheet.repairList, sheet.asIs, sheet.cash, sheet.breakEven)).toBe(
      "Your cash offer nets about $262,400: about $37,500 less than listing as-is, and about $59,300 less than repairing and listing.",
    );
  });

  it("says when the paths are about the same, or the offer nets more", () => {
    expect(compared(300_200, 300_000, "listing as-is")).toBe("about the same as listing as-is");
    expect(compared(310_000, 300_000, "listing as-is")).toBe("about $10,000 more than listing as-is");
  });

  it("describes how long each path takes", () => {
    expect(months(0.5)).toBe("About two weeks");
    expect(months(1)).toBe("About 1 month");
    expect(months(4.5)).toBe("About 4.5 months");
  });
});
