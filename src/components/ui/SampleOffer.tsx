import { isUnconfirmed, sampleOfferRows } from "@/lib/claims";
import { SAMPLE_CAPTION, samples, type Sample } from "@/content/samples";
import { Ledger } from "@/components/ui/Ledger";
import { Unconfirmed } from "@/components/preview";

/**
 * A sample written offer (spec 5.3): a Ledger fed by src/content/samples.ts.
 * The profit line is itemized only once written offers itemize it
 * (showsMarginInWriting); otherwise costs and profit share one line.
 */
export function SampleOffer({ id = "house", headingLevel = 3, className = "" }: { id?: Sample["id"]; headingLevel?: 2 | 3 | 4; className?: string }) {
  const sample = samples[id];
  const profitTag = isUnconfirmed("showsMarginInWriting");
  const rows = sampleOfferRows(sample).map((row) => ({
    label:
      row.kind === "profit" && profitTag ? (
        <>
          {row.label}
          <Unconfirmed show />
        </>
      ) : (
        row.label
      ),
    amount: row.amount,
    note: row.note,
  }));
  return (
    <Ledger
      title={sample.title}
      rows={rows}
      total={{ label: "Offer", amount: sample.offer, note: sample.offerNote }}
      sample
      caption={SAMPLE_CAPTION}
      headingLevel={headingLevel}
      className={className}
    />
  );
}
