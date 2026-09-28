/**
 * Illustrative sample offers (spec 5.3), shown as ledgers on the home, How it
 * works, offer and property-type pages. These are not real properties; every
 * sample carries SAMPLE_CAPTION. tests/samples.test.ts checks they add up.
 *
 * Rows are the offer math from top to bottom. `kind` lets claims.sampleOfferRows()
 * combine costs and profit into one line until Kane confirms that written
 * offers itemize his profit (site.verified.showsMarginInWriting).
 */

export type SampleRowKind = "value" | "repairs" | "assessment" | "cost" | "profit";

export type SampleRow = {
  kind: SampleRowKind;
  label: string;
  /** Positive for the after-repair value; negative for everything subtracted. */
  amount: number;
  note?: string;
};

export type Sample = {
  id: "house" | "condo";
  title: string;
  rows: SampleRow[];
  offer: number;
  offerNote?: string;
};

export const SAMPLE_CAPTION = "Illustrative numbers, not a real property.";

export const samples: Record<Sample["id"], Sample> = {
  house: {
    id: "house",
    title: "1960s bungalow in north Edmonton",
    rows: [
      { kind: "value", label: "After-repair value", amount: 425_000, note: "What it would likely sell for once fixed up, based on recent nearby sales" },
      { kind: "repairs", label: "Repairs", amount: -62_000, note: "Roof, Poly-B replacement, kitchen, flooring and paint" },
      { kind: "cost", label: "Buying and closing costs", amount: -4_000, note: "Legal fees, title insurance and adjustments" },
      { kind: "cost", label: "Holding costs", amount: -14_000, note: "About four months of taxes, insurance, utilities and financing" },
      { kind: "cost", label: "Resale costs", amount: -19_100, note: "Commission plus GST, and legal fees, when it's sold again" },
      { kind: "profit", label: "Profit", amount: -42_000, note: "Covers my fee, plus the renovating investor's profit if I assign the contract" },
    ],
    offer: 283_900,
    offerNote: "Before your mortgage payout and anything else registered on title",
  },
  condo: {
    id: "condo",
    title: "3-bedroom condo townhouse in a 1979 complex",
    rows: [
      { kind: "value", label: "After-repair value", amount: 265_000 },
      { kind: "repairs", label: "Repairs", amount: -34_000, note: "Flooring, kitchen, bathroom and paint" },
      { kind: "assessment", label: "Special assessment owing", amount: -8_000, note: "Your share, per the notice. The contract says who pays it" },
      { kind: "cost", label: "Buying and closing costs", amount: -3_500, note: "Legal fees and the condo document package" },
      { kind: "cost", label: "Holding costs", amount: -9_200, note: "About four months of condo fees, taxes, insurance, utilities and financing" },
      { kind: "cost", label: "Resale costs", amount: -14_050, note: "Commission plus GST, and legal fees" },
      { kind: "profit", label: "Profit", amount: -26_500, note: "Covers my fee, plus the renovating investor's profit if I assign the contract" },
    ],
    offer: 169_750,
  },
};
