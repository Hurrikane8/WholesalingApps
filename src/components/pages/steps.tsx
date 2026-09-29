import { phoneHref, site } from "@/config/site";
import { closingPhrase, isShown, isUnconfirmed, legalFeesSentence, offerMathClause, offerTimingPhrase } from "@/lib/claims";
import type { Step } from "@/components/ui/Steps";
import { TextLink } from "@/components/ui/TextLink";
import { Unconfirmed } from "@/components/preview";

/** The four steps on the home page (spec 5.3 §4). Every promise comes from claims. */
export function homeSteps(): Step[] {
  const legalFees = legalFeesSentence();
  return [
    {
      title: "Tell me about the place",
      text: <p>Fill in a two-minute form or make one phone call: the address, a few details and what&apos;s going on.</p>,
    },
    {
      title: "I see it",
      text: <p>One visit at a time that suits you, or a video walkthrough. No cleaning, no staging.</p>,
    },
    {
      title: "You get a written offer",
      text: (
        <p>
          I send it {offerTimingPhrase()}
          {offerMathClause()}. Take your time, and show it to family, a lawyer or an agent.
          <Unconfirmed show={isUnconfirmed("offerWithinHours")} />
        </p>
      ),
    },
    {
      title: "You choose the closing date",
      text: (
        <p>
          We close {closingPhrase()}. Lawyers on both sides handle the title, the mortgage payout and the paperwork, and you&apos;re paid through your
          lawyer&apos;s trust account.
          <Unconfirmed show={isUnconfirmed("closeInDays")} />
          {legalFees && (
            <>
              {" "}
              {legalFees}
              <Unconfirmed show={isUnconfirmed("coversLegalFees")} />
            </>
          )}
        </p>
      ),
    },
  ];
}

/** "What happens next" on the offer page (spec 5.4): three compact steps. */
export function nextSteps(): Step[] {
  return [
    {
      title: "I call you",
      text: (
        <p>
          From <TextLink href={`tel:${phoneHref}`} className="nums">{site.phone}</TextLink>, to ask a few questions about the place and what you need.
        </p>
      ),
    },
    {
      title: "I see it",
      text: <p>A visit at a time that suits you, or a video walkthrough. No cleaning, no staging.</p>,
    },
    {
      title: "You get a written offer",
      text: (
        <p>
          {isShown("offerWithinHours") ? capitalize(offerTimingPhrase()) : "In writing"}
          {offerMathClause()}. Take it, ask questions or say no.
          <Unconfirmed show={isUnconfirmed("offerWithinHours")} />
        </p>
      ),
    },
  ];
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
