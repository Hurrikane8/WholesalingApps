"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { OPT_OUT_CHANNELS, normalizePhone } from "@/lib/lead-options";
import { trackEvent } from "@/lib/analytics";
import { captureAttribution } from "@/lib/attribution";
import { Honeypot } from "@/components/form-parts";
import { Button } from "@/components/ui/Button";
import { ChipGroup, TextAreaField, TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";

type Values = { address: string; name: string; phone: string; email: string; channel: string; notes: string; website: string };

/**
 * "Not interested? I'll take you off my list." (spec 4.7). Only the address
 * is required. Same honeypot, timing check and rate limit as the seller form.
 */
export function OptOutForm({ phone, phoneHref }: { phone: string; phoneHref: string }) {
  const id = useId();
  const [values, setValues] = useState<Values>({ address: "", name: "", phone: "", email: "", channel: "", notes: "", website: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "done">("idle");
  const [formError, setFormError] = useState("");
  const [doneAddress, setDoneAddress] = useState("");
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

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (values.address.trim().length < 5) next.address = "Enter the street address the letter or visit was about";
    if (values.phone && !normalizePhone(values.phone)) next.phone = "Enter a 10-digit phone number, or leave it blank";
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) next.email = "Enter an email like name@example.ca, or leave it blank";
    if (Object.keys(next).length) {
      setErrors(next);
      document.getElementById(`${id}-${Object.keys(next)[0]}`)?.focus();
      return;
    }

    setStatus("submitting");
    setFormError("");
    try {
      const { firstTouch, lastTouch } = captureAttribution();
      const res = await fetch("/api/opt-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, page: window.location.pathname, firstTouch, lastTouch, startedAt: startedAt.current }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setFormError(data.error ?? `That didn't go through. Please call or text me at ${phone} and I'll take you off my list.`);
        if (data.fieldErrors) setErrors(data.fieldErrors as typeof errors);
        return;
      }
      trackEvent("opt_out_submit", { channel: values.channel || "not_given" });
      setDoneAddress(values.address.trim());
      setStatus("done");
    } catch {
      setStatus("error");
      setFormError(`That didn't go through. Please call or text me at ${phone} and I'll take you off my list.`);
    }
  };

  if (status === "done") {
    return (
      <div ref={doneRef} tabIndex={-1} className="outline-none">
        <Notice tone="success" title={`Got it. I'll take ${doneAddress} off my list.`}>
          If you hear from me again by mistake, call or text{" "}
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
    value: values[key],
    onChange: (e: { target: { value: string } }) => set(key, e.target.value),
    error: errors[key],
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Honeypot id={id} value={values.website} onChange={(v) => set("website", v)} />
      <TextField label="Property address" autoComplete="street-address" placeholder="e.g. 1234 56 St NW, Edmonton" required {...text("address")} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Name" optional autoComplete="name" {...text("name")} />
        <TextField label="Phone" optional type="tel" inputMode="tel" autoComplete="tel-national" {...text("phone")} />
      </div>
      <TextField label="Email" optional type="email" autoComplete="email" {...text("email")} />
      <ChipGroup
        id={`${id}-channel`}
        name={`${id}-channel`}
        legend="How did I reach you?"
        optional
        options={OPT_OUT_CHANNELS}
        value={values.channel}
        onChange={(v) => set("channel", v)}
      />
      <TextAreaField id={`${id}-notes`} name="notes" label="Anything else?" optional maxLength={1000} value={values.notes} onChange={(e) => set("notes", e.target.value)} />
      {formError && (
        <p role="alert" className="type-small font-semibold text-error">
          {formError}
        </p>
      )}
      <Button type="submit" variant="secondary" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Take me off your list"}
      </Button>
    </form>
  );
}
