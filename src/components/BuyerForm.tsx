"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { FINANCING, PROPERTY_TYPES, STRATEGIES, TARGET_AREAS, normalizePhone } from "@/lib/lead-options";
import { BUYER_CONSENT_TEXT } from "@/content/consent";
import { trackEvent } from "@/lib/analytics";
import { readAttribution } from "@/lib/attribution";
import { Honeypot } from "@/components/form-parts";
import { Button } from "@/components/ui/Button";
import { CheckChipGroup, Checkbox, TextAreaField, TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";

type Values = {
  name: string;
  email: string;
  phone: string;
  company: string;
  strategies: string[];
  propertyTypes: string[];
  targetAreas: string[];
  financing: string[];
  maxPrice: string;
  maxReno: string;
  maxCondoFee: string;
  dealsLast12Months: string;
  proofOfFunds: boolean;
  notes: string;
  consent: boolean;
  website: string;
};

const EMPTY: Values = {
  name: "",
  email: "",
  phone: "",
  company: "",
  strategies: [],
  propertyTypes: [],
  targetAreas: [],
  financing: [],
  maxPrice: "",
  maxReno: "",
  maxCondoFee: "",
  dealsLast12Months: "",
  proofOfFunds: false,
  notes: "",
  consent: false,
  website: "",
};

/** "$350,000" → 350000; empty → undefined. */
function toNumber(value: string): number | undefined {
  const digits = value.replace(/[^\d.]/g, "");
  if (!digits) return undefined;
  const n = Number(digits);
  return Number.isFinite(n) ? Math.round(n) : undefined;
}

type MultiKey = "strategies" | "propertyTypes" | "targetAreas" | "financing";

/**
 * Joins the investor buyers list (spec 4.9): same fields, validation and CASL
 * consent as before, restyled. Delivery runs through the sinks on the server.
 */
export function BuyerForm({ phone, phoneHref }: { phone: string; phoneHref: string }) {
  const id = useId();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "done">("idle");
  const [formError, setFormError] = useState("");
  const startedAt = useRef(0);
  const doneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (status === "done") doneRef.current?.focus();
  }, [status]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggle = (key: MultiKey, value: string) =>
    set(key, values[key].includes(value) ? values[key].filter((v) => v !== value) : [...values[key], value]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (values.name.trim().length < 2) next.name = "Enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) next.email = "Enter an email like name@example.ca";
    if (!normalizePhone(values.phone)) next.phone = "Enter a 10-digit phone number, like 780 555 0123";
    if (!values.consent) next.consent = "Tick the box to join the list: it's how I get your consent to send deals";
    if (Object.keys(next).length) {
      setErrors(next);
      document.getElementById(`${id}-${Object.keys(next)[0]}`)?.focus();
      return;
    }

    setStatus("submitting");
    setFormError("");
    try {
      const res = await fetch("/api/buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          maxPrice: toNumber(values.maxPrice),
          maxReno: toNumber(values.maxReno),
          maxCondoFee: toNumber(values.maxCondoFee),
          dealsLast12Months: toNumber(values.dealsLast12Months),
          page: window.location.pathname,
          referrer: document.referrer,
          utm: readAttribution(),
          startedAt: startedAt.current,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setFormError(data.error ?? `That didn't go through. Please call or text me at ${phone}.`);
        if (data.fieldErrors) setErrors(data.fieldErrors as typeof errors);
        return;
      }
      trackEvent("buyer_signup");
      setStatus("done");
    } catch {
      setStatus("error");
      setFormError(`That didn't go through. Please check your connection, or call or text me at ${phone}.`);
    }
  };

  if (status === "done") {
    return (
      <div ref={doneRef} tabIndex={-1} className="rounded-card border border-mist bg-white p-6 outline-none sm:p-8">
        <Notice tone="success" title="You're on the list.">
          I&apos;ll be in touch to confirm what you buy. When a property fits, you&apos;ll hear from me by email and text. Questions in
          the meantime? Call or text{" "}
          <a href={`tel:${phoneHref}`} className="link font-semibold">
            {phone}
          </a>
          .
        </Notice>
      </div>
    );
  }

  const text = (key: keyof Values) => ({
    id: `${id}-${key}`,
    name: key,
    value: values[key] as string,
    onChange: (e: { target: { value: string } }) => set(key, e.target.value as never),
    error: errors[key],
  });

  return (
    <form onSubmit={submit} noValidate className="rounded-card border border-mist bg-white p-6 sm:p-8">
      <Honeypot id={id} value={values.website} onChange={(v) => set("website", v)} />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Name" autoComplete="name" {...text("name")} />
        <TextField label="Company" optional autoComplete="organization" {...text("company")} />
        <TextField label="Email" type="email" autoComplete="email" {...text("email")} />
        <TextField label="Phone" type="tel" inputMode="tel" autoComplete="tel-national" {...text("phone")} />
      </div>

      <div className="mt-8 space-y-6">
        <CheckChipGroup id={`${id}-strategies`} legend="Your strategy (pick any)" options={STRATEGIES} values={values.strategies} onToggle={(v) => toggle("strategies", v)} />
        <CheckChipGroup id={`${id}-propertyTypes`} legend="Property types you buy (pick any)" options={PROPERTY_TYPES} values={values.propertyTypes} onToggle={(v) => toggle("propertyTypes", v)} />
        <CheckChipGroup id={`${id}-targetAreas`} legend="Where you'll buy (pick any)" options={TARGET_AREAS} values={values.targetAreas} onToggle={(v) => toggle("targetAreas", v)} />
        <CheckChipGroup id={`${id}-financing`} legend="How you'll fund purchases (pick any)" options={FINANCING} values={values.financing} onToggle={(v) => toggle("financing", v)} />
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <TextField label="Max purchase price" optional inputMode="numeric" placeholder="$" {...text("maxPrice")} />
        <TextField label="Max renovation budget" optional inputMode="numeric" placeholder="$" {...text("maxReno")} />
        <TextField label="Max monthly condo fee" optional inputMode="numeric" placeholder="$" {...text("maxCondoFee")} />
        <TextField label="Properties bought in the last 12 months" optional inputMode="numeric" {...text("dealsLast12Months")} />
      </div>

      <Checkbox
        id={`${id}-proofOfFunds`}
        className="mt-6"
        label="I can provide proof of funds or a lender letter when I make an offer."
        checked={values.proofOfFunds}
        onChange={(e) => set("proofOfFunds", e.target.checked)}
      />

      <TextAreaField
        className="mt-5"
        id={`${id}-notes`}
        name="notes"
        label="Anything else?"
        optional
        maxLength={2000}
        placeholder="e.g. specific complexes you like, bedroom count, must-haves or dealbreakers"
        value={values.notes}
        onChange={(e) => set("notes", e.target.value)}
      />

      <div className="mt-6 rounded-field bg-frost p-4">
        <Checkbox
          id={`${id}-consent`}
          checked={values.consent}
          onChange={(e) => set("consent", e.target.checked)}
          error={errors.consent}
          label={
            <>
              {BUYER_CONSENT_TEXT} See the{" "}
              <Link href="/privacy" className="link">
                Privacy Policy
              </Link>
              .
            </>
          }
        />
      </div>

      {formError && (
        <p role="alert" className="type-small mt-5 font-semibold text-error">
          {formError}
        </p>
      )}

      <Button type="submit" className="mt-6 w-full sm:w-auto" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Join the buyers list"}
      </Button>
    </form>
  );
}
