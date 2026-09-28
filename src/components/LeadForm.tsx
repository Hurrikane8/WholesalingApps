"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, LoaderCircle, Lock } from "lucide-react";
import { CONDITIONS, OCCUPANCY, PROPERTY_TYPES, TIMELINES, normalizePhone, type Option, type Reason } from "@/lib/lead-options";
import { phoneHref, site } from "@/config/site";
import { trackEvent } from "@/lib/analytics";
import { readAttribution } from "@/lib/attribution";
import { FieldError, Honeypot } from "@/components/form-parts";

type Values = {
  address: string;
  name: string;
  phone: string;
  email: string;
  propertyType: string;
  condition: string;
  timeline: string;
  occupancy: string;
  notes: string;
  smsConsent: boolean;
  website: string;
};

const EMPTY: Values = {
  address: "",
  name: "",
  phone: "",
  email: "",
  propertyType: "",
  condition: "",
  timeline: "",
  occupancy: "",
  notes: "",
  smsConsent: false,
  website: "",
};

type Props = {
  /** Heading shown above the form. */
  title?: string;
  subtitle?: string;
  /** Visual treatment: "card" floats on colored backgrounds, "plain" sits inside existing cards. */
  variant?: "card" | "plain";
  /** Seller situation, when the form sits on a page about one (e.g. foreclosure). */
  reason?: Reason;
};

export function LeadForm({
  title = "What would you get for your place?",
  subtitle = "Two quick steps. No obligation.",
  variant = "card",
  reason,
}: Props) {
  const id = useId();
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [formError, setFormError] = useState("");
  const startedAt = useRef(0);
  const nameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const hasMovedSteps = useRef(false);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    // Move focus when the step changes (but not on first render) for keyboard and screen-reader users.
    if (!hasMovedSteps.current) return;
    (step === 2 ? nameRef : addressRef).current?.focus();
  }, [step]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const goToStep = (next: 1 | 2) => {
    hasMovedSteps.current = true;
    setStep(next);
  };

  const handleStep1 = () => {
    if (values.address.trim().length < 5) {
      setErrors({ address: "Please enter the property address" });
      addressRef.current?.focus();
      return;
    }
    trackEvent("lead_form_start");
    goToStep(2);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step === 1) return handleStep1();

    const nextErrors: typeof errors = {};
    if (values.name.trim().length < 2) nextErrors.name = "Please enter your name";
    if (!normalizePhone(values.phone)) nextErrors.phone = "Please enter a valid 10-digit phone number";
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) nextErrors.email = "Please enter a valid email";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setStatus("submitting");
    setFormError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          reason: reason ?? "",
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
        if (data.fieldErrors) {
          setErrors(data.fieldErrors as typeof errors);
          if (data.fieldErrors.address) goToStep(1);
        }
        return;
      }

      trackEvent("generate_lead", { form: "seller_offer" });
      // A full page load (not a client-side push) starts the thank-you page at the top
      // and registers a normal page view that ad platforms can use as a conversion.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- intentional full load, see above
      window.location.assign("/thank-you");
    } catch {
      setStatus("error");
      setFormError(`We couldn't send your request. Please check your connection or call us at ${site.phone}.`);
    }
  };

  const field = (key: keyof Values) => ({
    id: `${id}-${key}`,
    name: key,
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${id}-${key}-error` : undefined,
  });

  const wrapper =
    variant === "card"
      ? "rounded-2xl bg-white p-6 text-slate-800 shadow-2xl shadow-brand-950/30 ring-1 ring-slate-900/5 sm:p-8"
      : "text-slate-800";

  return (
    <div className={wrapper}>
      <div className="mb-5">
        <p className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</p>
        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      </div>

      <div className="mb-5 flex items-center gap-2" aria-hidden="true">
        <span className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-accent-400" : "bg-slate-200"}`} />
        <span className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-accent-400" : "bg-slate-200"}`} />
      </div>
      <p className="sr-only" aria-live="polite">
        Step {step} of 2
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <Honeypot id={id} value={values.website} onChange={(v) => set("website", v)} />

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label htmlFor={`${id}-address`} className="field-label">
                Property address
              </label>
              <input
                {...field("address")}
                ref={addressRef}
                type="text"
                autoComplete="street-address"
                placeholder="e.g. 1234 56 St NW, Edmonton"
                className="field-input"
                value={values.address}
                onChange={(e) => set("address", e.target.value)}
                required
              />
              <FieldError id={`${id}-address-error`} message={errors.address} />
            </div>
            <button type="submit" className="btn-primary w-full text-lg">
              Get My Cash Offer
              <ArrowRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <span className="w-0 flex-1 truncate">
                <span className="font-medium">Property:</span> {values.address}
              </span>
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="inline-flex shrink-0 items-center gap-0.5 font-medium text-brand-600 hover:text-brand-800"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                Edit
              </button>
            </p>

            <div>
              <label htmlFor={`${id}-name`} className="field-label">
                Your name
              </label>
              <input
                {...field("name")}
                ref={nameRef}
                type="text"
                autoComplete="name"
                className="field-input"
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
              <FieldError id={`${id}-name-error`} message={errors.name} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${id}-phone`} className="field-label">
                  Phone
                </label>
                <input
                  {...field("phone")}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(780) 555-5555"
                  className="field-input"
                  value={values.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  required
                />
                <FieldError id={`${id}-phone-error`} message={errors.phone} />
              </div>
              <div>
                <label htmlFor={`${id}-email`} className="field-label">
                  Email <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  {...field("email")}
                  type="email"
                  autoComplete="email"
                  className="field-input"
                  value={values.email}
                  onChange={(e) => set("email", e.target.value)}
                />
                <FieldError id={`${id}-email-error`} message={errors.email} />
              </div>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-slate-700">
                About the property <span className="font-normal text-slate-500">(optional, helps us make an accurate offer)</span>
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField id={`${id}-propertyType`} label="Property type" options={PROPERTY_TYPES} value={values.propertyType} onChange={(v) => set("propertyType", v)} />
                <SelectField id={`${id}-condition`} label="Condition" options={CONDITIONS} value={values.condition} onChange={(v) => set("condition", v)} />
                <SelectField id={`${id}-timeline`} label="When do you want to sell?" options={TIMELINES} value={values.timeline} onChange={(v) => set("timeline", v)} />
                <SelectField id={`${id}-occupancy`} label="Who lives there now?" options={OCCUPANCY} value={values.occupancy} onChange={(v) => set("occupancy", v)} />
              </div>
              <label htmlFor={`${id}-notes`} className="field-label mt-3">
                What&apos;s prompting the sale?
              </label>
              <textarea
                id={`${id}-notes`}
                name="notes"
                rows={2}
                maxLength={2000}
                placeholder="e.g. condo fees keep going up, inherited it, moving for work…"
                className="field-input resize-y"
                value={values.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </fieldset>

            <div className="flex items-start gap-3">
              <input
                id={`${id}-smsConsent`}
                name="smsConsent"
                type="checkbox"
                className="mt-1 size-4 shrink-0 rounded border-slate-300 accent-brand-600"
                checked={values.smsConsent}
                onChange={(e) => set("smsConsent", e.target.checked)}
              />
              <label htmlFor={`${id}-smsConsent`} className="text-xs leading-relaxed text-slate-600">
                Yes, {site.name} may text me at the number above about my property. Consent is not required to get an
                offer. Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help. See
                our{" "}
                <Link href="/privacy" className="underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms" className="underline">
                  Terms
                </Link>
                .
              </label>
            </div>

            {formError && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}{" "}
                <a href={`tel:${phoneHref}`} className="font-semibold underline">
                  {site.phone}
                </a>
              </p>
            )}

            <button type="submit" className="btn-primary w-full text-lg" disabled={status === "submitting"}>
              {status === "submitting" ? (
                <>
                  <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
                  Sending…
                </>
              ) : (
                <>
                  Send Me My Offer
                  <ArrowRight className="size-5" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        )}

        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <Lock className="size-3.5" aria-hidden="true" />
          Your information is private and never sold.
        </p>
      </form>
    </div>
  );
}

function SelectField({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>
      <select id={id} className="field-input py-2.5" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
