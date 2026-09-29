"use client";

import { useMemo, useSyncExternalStore } from "react";
import { buttonClass } from "@/components/ui/Button";

/** What LeadFormClient saves in sessionStorage on success: a first name and a few choices, nothing else. */
type StoredLead = { firstName?: string; propertyType?: string; occupancy?: string; hasEmail?: boolean };

const KEY = "aurora_lead";
const noSubscribe = () => () => {};

function readStorage(): string | null {
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** Reads the saved lead after hydration; the server render (and a blocked storage) gets the generic version. */
function useStoredLead(): StoredLead {
  const raw = useSyncExternalStore(noSubscribe, readStorage, () => null);
  return useMemo(() => {
    if (!raw) return {};
    try {
      const value = JSON.parse(raw) as StoredLead;
      return typeof value === "object" && value ? value : {};
    } catch {
      return {};
    }
  }, [raw]);
}

/** The centred H1 and the line under it (spec 5.11). */
export function ThankYouHeading({ nextLine, sellerEmailsOn }: { nextLine: string; sellerEmailsOn: boolean }) {
  const lead = useStoredLead();
  const name = lead.firstName?.trim().slice(0, 40);
  return (
    <>
      <h1 className="type-h1 mx-auto max-w-[22ch] text-center">{name ? `Thanks, ${name}. I've got your request.` : "Thanks. I've got your request."}</h1>
      <p className="type-lead mx-auto mt-5 max-w-[40ch] text-center text-ink-2">
        {nextLine}
        {sellerEmailsOn && lead.hasEmail ? " I've also emailed you a copy." : ""}
      </p>
    </>
  );
}

const CONDO_TYPES = ["Condo townhouse", "Apartment condo"];

/** "If you have them handy": tailored to the property type and occupancy the seller picked. None of it is required. */
export function HandyList() {
  const lead = useStoredLead();
  const items = [
    "A recent mortgage statement or your payout amount.",
    "Anything you know the place needs: the roof, windows, furnace, plumbing or foundation.",
    ...(lead.propertyType && CONDO_TYPES.includes(lead.propertyType)
      ? ["The monthly condo fee.", "Any special assessment notice.", "The latest AGM minutes, budget and reserve fund study."]
      : []),
    ...(lead.occupancy === "Tenanted" ? ["The lease and the monthly rent."] : []),
  ];
  return (
    <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-line">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** "Book a call", tracked as booking_click by the ClickTracker. */
export function BookingLink({ href }: { href: string }) {
  return (
    <a href={href} className={buttonClass("secondary")} data-track="booking_click" data-track-location="thank_you">
      Book a call
    </a>
  );
}
