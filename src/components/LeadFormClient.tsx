"use client";

import { Turnstile } from "@/components/Turnstile";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { CONDITIONS, OCCUPANCY, REASONS, TIMELINES, normalizePhone, type Reason } from "@/lib/lead-options";
import { pageType, trackEvent } from "@/lib/analytics";
import { captureAttribution } from "@/lib/attribution";
import { Honeypot } from "@/components/form-parts";
import { Button } from "@/components/ui/Button";
import { Checkbox, ChipGroup, SelectField, TextAreaField, TextField, type ChipOption } from "@/components/ui/Field";

type Values = {
  address: string;
  name: string;
  phone: string;
  email: string;
  propertyType: string;
  timeline: string;
  condition: string;
  occupancy: string;
  reason: string;
  notes: string;
  smsConsent: boolean;
  website: string;
};

type Errors = Partial<Record<keyof Values, string>>;

export type LeadFormClientProps = {
  /** "offer" for the primary form on a page, "offer-bottom" for a second one. */
  formId: string;
  title: string;
  subtitle: string;
  variant: "card" | "plain";
  /** Shown property types, in config order: { value (Airtable choice), label }. */
  propertyTypes: ChipOption[];
  propertyType?: string;
  reason?: Reason;
  /** claims.responseLine(), computed on the server. */
  responseLine: string | null;
  businessName: string;
  phone: string;
  phoneHref: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LABELS: Record<string, string> = {
  address: "Property address",
  name: "Your name",
  phone: "Phone",
  email: "Email",
};

/**
 * The seller form (spec 4.1): the address, then how to reach you. Keeps
 * everything the seller typed on any error; on a 502 it offers call and text
 * instead. Marked data-lead-form so the sticky actions bar can find it.
 */
export function LeadFormClient(props: LeadFormClientProps) {
  const { formId, title, subtitle, variant, propertyTypes, responseLine, businessName, phone, phoneHref } = props;
  const uid = useId();
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<Values>({
    address: "",
    name: "",
    phone: "",
    email: "",
    propertyType: props.propertyType ?? "",
    timeline: "",
    condition: "",
    occupancy: "",
    reason: props.reason ?? "",
    notes: "",
    smsConsent: false,
    website: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "undelivered" | "error">("idle");
  const [formError, setFormError] = useState("");
  const startedAt = useRef(0);
  const turnstileToken = useRef("");
  const submissionId = useRef("");
  const addressRef = useRef<HTMLInputElement>(null);
  const step2Heading = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    startedAt.current = Date.now();
    submissionId.current = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }, []);

  useEffect(() => {
    // Move focus with the step (not on first render), for keyboard and screen-reader users.
    if (!moved.current) return;
    if (step === 2) step2Heading.current?.focus();
    else addressRef.current?.focus();
  }, [step]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const goTo = (next: 1 | 2) => {
    moved.current = true;
    setStep(next);
  };

  const fieldId = (key: keyof Values) => `${uid}-${key}`;

  const showErrors = (next: Errors) => {
    setErrors(next);
    requestAnimationFrame(() => summaryRef.current?.focus());
  };

  const nextStep = () => {
    if (values.address.trim().length < 5) {
      setErrors({ address: "Enter the street address and city" });
      addressRef.current?.focus();
      return;
    }
    setErrors({});
    // ?type= preselects a property type (when the page didn't), if it's one this form offers.
    const fromUrl = new URLSearchParams(window.location.search).get("type");
    if (!values.propertyType && fromUrl && propertyTypes.some((t) => t.value === fromUrl)) set("propertyType", fromUrl);
    trackEvent("lead_form_start", { form_id: formId, page_type: pageType(window.location.pathname) });
    goTo(2);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 1) return nextStep();

    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = "Enter your name";
    if (!normalizePhone(values.phone)) next.phone = "Enter a 10-digit phone number, like 780 555 0123";
    if (values.email && !EMAIL.test(values.email.trim())) next.email = "Enter an email like name@example.ca, or leave it blank";
    if (Object.keys(next).length) return showErrors(next);

    setStatus("submitting");
    setFormError("");
    try {
      const { firstTouch, lastTouch } = captureAttribution();
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          submissionId: submissionId.current,
          page: window.location.pathname,
          referrer: document.referrer,
          firstTouch,
          lastTouch,
          startedAt: startedAt.current,
          turnstileToken: turnstileToken.current,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fieldErrors?: Errors };

      if (res.status === 502 || res.status >= 500) {
        setStatus("undelivered");
        return;
      }
      if (!res.ok || !data.ok) {
        setStatus("error");
        setFormError(data.error ?? "Please fix the fields marked below.");
        if (data.fieldErrors) {
          if (data.fieldErrors.address) goTo(1);
          showErrors(data.fieldErrors);
        }
        return;
      }

      try {
        sessionStorage.setItem(
          "aurora_lead",
          JSON.stringify({
            firstName: values.name.trim().split(/\s+/)[0],
            propertyType: values.propertyType,
            occupancy: values.occupancy,
            hasEmail: Boolean(values.email.trim()),
          }),
        );
      } catch {
        // the thank-you page falls back to a generic greeting
      }
      // Never personal information in analytics.
      trackEvent("generate_lead", {
        form_id: formId,
        page_type: pageType(window.location.pathname),
        property_type: values.propertyType || "not_given",
        timeline: values.timeline || "not_given",
      });
      // A full page load starts the thank-you page at the top and registers a normal page view.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- intentional full load
      window.location.assign("/thank-you");
    } catch {
      setStatus("undelivered");
    }
  };

  const errorList = Object.entries(errors).filter(([, message]) => message) as [keyof Values, string][];
  const card = variant === "card" ? "rounded-card border border-mist bg-white p-6 shadow-float sm:p-8" : "";

  return (
    <div id={formId} data-lead-form="" className={`scroll-mt-24 text-ink ${card}`}>
      <h2 className="type-h3 text-ink">{title}</h2>
      <p className="type-small mt-1 text-ink-2">{subtitle}</p>
      <p className="sr-only" aria-live="polite">
        Step {step} of 2
      </p>

      <form onSubmit={submit} noValidate className="mt-5">
        <Honeypot id={uid} value={values.website} onChange={(v) => set("website", v)} />

        {errorList.length > 0 && (
          <div ref={summaryRef} tabIndex={-1} role="alert" className="mb-5 border-l-4 border-error bg-white px-4 py-3 outline-none">
            <p className="type-small font-semibold text-error">
              {errorList.length === 1 ? "Please fix one thing:" : `Please fix ${errorList.length} things:`}
            </p>
            <ul className="type-small mt-1 list-disc pl-5 text-ink">
              {errorList.map(([key, message]) => (
                <li key={key}>
                  <a href={`#${fieldId(key)}`} className="link">
                    {LABELS[key] ?? key}: {message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-4">
            <TextField
              ref={addressRef}
              id={fieldId("address")}
              name="address"
              label="Property address"
              autoComplete="street-address"
              placeholder="e.g. 1234 56 St NW, Edmonton"
              value={values.address}
              onChange={(e) => set("address", e.target.value)}
              error={errors.address}
              required
            />
            <Button type="submit" className="w-full">
              Next
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <h3 ref={step2Heading} tabIndex={-1} className="font-display text-[1.125rem] font-bold text-ink outline-none">
              How do I reach you?
            </h3>
            <TextField
              id={fieldId("name")}
              name="name"
              label="Your name"
              autoComplete="name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              error={errors.name}
              required
            />
            <TextField
              id={fieldId("phone")}
              name="phone"
              label="Phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              hint={`I'll call from ${phone}.`}
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              error={errors.phone}
              required
            />
            <TextField
              id={fieldId("email")}
              name="email"
              label="Email"
              optional
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              error={errors.email}
            />
            <ChipGroup
              id={fieldId("propertyType")}
              name={`${uid}-propertyType`}
              legend="Property type"
              options={propertyTypes}
              value={values.propertyType}
              onChange={(v) => set("propertyType", v)}
            />
            <ChipGroup
              id={fieldId("timeline")}
              name={`${uid}-timeline`}
              legend="When would you like to sell?"
              options={TIMELINES}
              value={values.timeline}
              onChange={(v) => set("timeline", v)}
            />

            <details className="group rounded-field border border-mist">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                Add details (optional)
                <ChevronDown className="size-5 shrink-0 text-ink-2 transition-transform duration-150 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="space-y-5 border-t border-mist p-4">
                <ChipGroup
                  id={fieldId("condition")}
                  name={`${uid}-condition`}
                  legend="Condition"
                  options={CONDITIONS}
                  value={values.condition}
                  onChange={(v) => set("condition", v)}
                />
                <ChipGroup
                  id={fieldId("occupancy")}
                  name={`${uid}-occupancy`}
                  legend="Who lives there now?"
                  options={OCCUPANCY}
                  value={values.occupancy}
                  onChange={(v) => set("occupancy", v)}
                />
                <SelectField
                  id={fieldId("reason")}
                  name="reason"
                  label="What's behind the sale?"
                  options={REASONS.map((r) => ({ value: r, label: r }))}
                  value={values.reason}
                  onChange={(e) => set("reason", e.target.value)}
                />
                <TextAreaField
                  id={fieldId("notes")}
                  name="notes"
                  label="Anything I should know?"
                  maxLength={2000}
                  placeholder="e.g. the condo fees keep going up, it's an estate, I'm moving for work"
                  value={values.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </div>
            </details>

            <Checkbox
              id={fieldId("smsConsent")}
              name="smsConsent"
              fine
              checked={values.smsConsent}
              onChange={(e) => set("smsConsent", e.target.checked)}
              label={
                <>
                  Yes, {businessName} may text me at this number about my property. Consent isn&apos;t required to get an offer. Message
                  frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. See the{" "}
                  <Link href="/privacy" className="link">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/terms" className="link">
                    Terms
                  </Link>
                  .
                </>
              }
            />

            {status === "undelivered" && (
              <div role="alert" className="border-l-4 border-error bg-white px-4 py-3">
                <p className="type-small font-semibold text-error">
                  Your request didn&apos;t go through. Please call or text me at {phone}.
                </p>
                <p className="type-small mt-2 flex flex-wrap gap-x-5">
                  <a href={`tel:${phoneHref}`} className="link inline-flex min-h-11 items-center font-semibold">
                    Call {phone}
                  </a>
                  <a href={`sms:${phoneHref}`} className="link inline-flex min-h-11 items-center font-semibold">
                    Text {phone}
                  </a>
                </p>
              </div>
            )}
            {status === "error" && formError && errorList.length === 0 && (
              <p role="alert" className="type-small font-semibold text-error">
                {formError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={status === "submitting"}>
              {status === "submitting" ? "Sending…" : "Send my request"}
            </Button>
            <div className="type-fine space-y-1 text-center text-ink-2">
              <p>Private. Never sold or shared for marketing.</p>
              {responseLine && <p>{responseLine}</p>}
            </div>
            <p className="text-center">
              <button type="button" onClick={() => goTo(1)} className="link type-small inline-flex min-h-11 items-center">
                Back
              </button>
            </p>
          </div>
        )}
        <Turnstile onToken={(token) => (turnstileToken.current = token)} />
      </form>
    </div>
  );
}
