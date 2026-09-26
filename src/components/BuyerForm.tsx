"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleCheck, LoaderCircle } from "lucide-react";
import { FINANCING, PROPERTY_TYPES, STRATEGIES, TARGET_AREAS, normalizePhone, type Option } from "@/lib/lead-options";
import { phoneHref, site } from "@/config/site";
import { BUYER_CONSENT_TEXT } from "@/content/consent";
import { trackEvent } from "@/lib/analytics";
import { readAttribution } from "@/lib/attribution";
import { FieldError, Honeypot } from "@/components/form-parts";

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

/** Joins the investor buyers list; writes to the Airtable Buyers table via /api/buyers. */
export function BuyerForm() {
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

  const toggle = (key: "strategies" | "propertyTypes" | "targetAreas" | "financing", value: string) =>
    set(key, values[key].includes(value) ? values[key].filter((v) => v !== value) : [...values[key], value]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (values.name.trim().length < 2) nextErrors.name = "Please enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) nextErrors.email = "Please enter a valid email";
    if (!normalizePhone(values.phone)) nextErrors.phone = "Please enter a valid 10-digit phone number";
    if (!values.consent) nextErrors.consent = "Please confirm you'd like to receive deals by email and text";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      document.getElementById(`${id}-${Object.keys(nextErrors)[0]}`)?.focus();
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
        setFormError(data.error ?? `Something went wrong. Please call or text us at ${site.phone}.`);
        if (data.fieldErrors) setErrors(data.fieldErrors as typeof errors);
        return;
      }
      trackEvent("buyer_signup", { form: "buyers_list" });
      setStatus("done");
    } catch {
      setStatus("error");
      setFormError(`We couldn't send your details. Please check your connection or call us at ${site.phone}.`);
    }
  };

  if (status === "done") {
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className="rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-900/5 outline-none">
        <CircleCheck className="mx-auto size-14 text-emerald-600" aria-hidden="true" />
        <p className="mt-4 text-2xl font-bold text-slate-900">You&apos;re on the list!</p>
        <p className="mt-2 text-slate-600">
          We&apos;ll reach out to confirm your criteria. When we have a property that fits, you&apos;ll hear from us by
          email and text. Questions in the meantime? Call or text{" "}
          <a href={`tel:${phoneHref}`} className="font-semibold text-brand-600">
            {site.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  const field = (key: keyof Values) => ({
    id: `${id}-${key}`,
    name: key,
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${id}-${key}-error` : undefined,
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-900/5 sm:p-8">
      <Honeypot id={id} value={values.website} onChange={(v) => set("website", v)} />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" {...field("name")} autoComplete="name" value={values.name} onChange={(v) => set("name", v)} error={errors.name} />
        <TextField label="Company" optional {...field("company")} autoComplete="organization" value={values.company} onChange={(v) => set("company", v)} />
        <TextField label="Email" {...field("email")} type="email" autoComplete="email" value={values.email} onChange={(v) => set("email", v)} error={errors.email} />
        <TextField label="Phone" {...field("phone")} type="tel" autoComplete="tel" placeholder="(780) 555-5555" value={values.phone} onChange={(v) => set("phone", v)} error={errors.phone} />
      </div>

      <div className="mt-8 space-y-6">
        <ChoiceGroup legend="Your strategy" options={STRATEGIES} selected={values.strategies} onToggle={(v) => toggle("strategies", v)} />
        <ChoiceGroup legend="Property types you buy" options={PROPERTY_TYPES} selected={values.propertyTypes} onToggle={(v) => toggle("propertyTypes", v)} />
        <ChoiceGroup legend="Where you'll buy" options={TARGET_AREAS} selected={values.targetAreas} onToggle={(v) => toggle("targetAreas", v)} />
        <ChoiceGroup legend="How you'll fund purchases" options={FINANCING} selected={values.financing} onToggle={(v) => toggle("financing", v)} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <TextField label="Max purchase price" optional {...field("maxPrice")} inputMode="numeric" placeholder="$" value={values.maxPrice} onChange={(v) => set("maxPrice", v)} />
        <TextField label="Max renovation budget" optional {...field("maxReno")} inputMode="numeric" placeholder="$" value={values.maxReno} onChange={(v) => set("maxReno", v)} />
        <TextField label="Max monthly condo fee" optional {...field("maxCondoFee")} inputMode="numeric" placeholder="$" value={values.maxCondoFee} onChange={(v) => set("maxCondoFee", v)} />
        <TextField label="Properties bought in the last 12 months" optional {...field("dealsLast12Months")} inputMode="numeric" value={values.dealsLast12Months} onChange={(v) => set("dealsLast12Months", v)} />
      </div>

      <label className="mt-5 flex items-start gap-3 text-sm text-slate-700">
        <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-brand-600" checked={values.proofOfFunds} onChange={(e) => set("proofOfFunds", e.target.checked)} />
        I can provide proof of funds or a lender letter when I make an offer.
      </label>

      <div className="mt-5">
        <label htmlFor={`${id}-notes`} className="field-label">
          Anything else? <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          id={`${id}-notes`}
          rows={3}
          maxLength={2000}
          placeholder="e.g. specific complexes you like, bedroom count, must-haves or dealbreakers"
          className="field-input resize-y"
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </div>

      <div className="mt-6 rounded-xl bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <input
            {...field("consent")}
            type="checkbox"
            className="mt-1 size-4 shrink-0 accent-brand-600"
            checked={values.consent}
            onChange={(e) => set("consent", e.target.checked)}
          />
          <label htmlFor={`${id}-consent`} className="text-sm leading-relaxed text-slate-700">
            {BUYER_CONSENT_TEXT} See our{" "}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </label>
        </div>
        <FieldError id={`${id}-consent-error`} message={errors.consent} />
      </div>

      {formError && (
        <p role="alert" className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <button type="submit" className="btn-primary mt-6 w-full text-lg sm:w-auto" disabled={status === "submitting"}>
        {status === "submitting" ? (
          <>
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            Join the Buyers List
            <ArrowRight className="size-5" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}

function TextField({
  label,
  optional,
  error,
  onChange,
  ...input
}: {
  label: string;
  optional?: boolean;
  error?: string;
  onChange: (value: string) => void;
  id: string;
  name: string;
  value: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
  placeholder?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  return (
    <div>
      <label htmlFor={input.id} className="field-label">
        {label} {optional && <span className="font-normal text-slate-500">(optional)</span>}
      </label>
      <input {...input} type={input.type ?? "text"} className="field-input" onChange={(e) => onChange(e.target.value)} />
      <FieldError id={`${input.id}-error`} message={error} />
    </div>
  );
}

function ChoiceGroup({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: readonly Option[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-700">
        {legend} <span className="font-normal text-slate-500">(pick any)</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const checked = selected.includes(o.value);
          return (
            <label
              key={o.value}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500 ${
                checked ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-brand-300"
              }`}
            >
              <input type="checkbox" className="sr-only" checked={checked} onChange={() => onToggle(o.value)} />
              {checked && <CircleCheck className="size-4" aria-hidden="true" />}
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
