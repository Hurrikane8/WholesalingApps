import type { ComponentProps, ReactNode } from "react";

/**
 * Form fields (spec 3.7). Every control has a visible label, an optional hint
 * and an error message wired up with aria-describedby. Inputs are 52px tall,
 * with 8px corners and a `line` border (2px `error` when invalid).
 * No hooks: works in server and client components alike.
 */

/** The ids a control should reference in aria-describedby. */
export function describedBy(id: string, { hint, error }: { hint?: ReactNode; error?: ReactNode }): string | undefined {
  return [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
}

export function FieldLabel({ htmlFor, children, optional }: { htmlFor: string; children: ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="type-small mb-1.5 block font-semibold text-ink">
      {children}
      {optional && <span className="font-normal text-ink-2"> (optional)</span>}
    </label>
  );
}

export function FieldHint({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={`${id}-hint`} className="type-small mb-2 text-ink-2">
      {children}
    </p>
  );
}

export function FieldError({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={`${id}-error`} className="type-small mt-1.5 font-semibold text-error">
      {children}
    </p>
  );
}

type Shell = { id: string; label: ReactNode; hint?: ReactNode; error?: ReactNode; optional?: boolean; className?: string };

export function TextField({ id, label, hint, error, optional, className = "", ...input }: Shell & Omit<ComponentProps<"input">, "id" | "className">) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} optional={optional}>
        {label}
      </FieldLabel>
      <FieldHint id={id}>{hint}</FieldHint>
      <input
        id={id}
        className="field-control"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { hint, error })}
        {...input}
      />
      <FieldError id={id}>{error}</FieldError>
    </div>
  );
}

export function TextAreaField({ id, label, hint, error, optional, className = "", ...textarea }: Shell & Omit<ComponentProps<"textarea">, "id" | "className">) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} optional={optional}>
        {label}
      </FieldLabel>
      <FieldHint id={id}>{hint}</FieldHint>
      <textarea
        id={id}
        rows={3}
        className="field-control resize-y"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { hint, error })}
        {...textarea}
      />
      <FieldError id={id}>{error}</FieldError>
    </div>
  );
}

export function SelectField({
  id,
  label,
  hint,
  error,
  optional,
  className = "",
  options,
  placeholder = "Choose one",
  ...select
}: Shell & { options: readonly { value: string; label: string }[]; placeholder?: string } & Omit<ComponentProps<"select">, "id" | "className">) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} optional={optional}>
        {label}
      </FieldLabel>
      <FieldHint id={id}>{hint}</FieldHint>
      <select
        id={id}
        className="field-control appearance-auto"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { hint, error })}
        {...select}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <FieldError id={id}>{error}</FieldError>
    </div>
  );
}

export type ChipOption = { value: string; label: string };

/**
 * Chips (spec 3.7): radio inputs inside a fieldset with a legend, at least
 * 44px tall. Controlled (value + onChange) or uncontrolled (defaultValue).
 * Selected chips turn pine with bold text, so selection never rests on colour alone.
 */
export function ChipGroup({
  id,
  name,
  legend,
  options,
  value,
  defaultValue,
  onChange,
  hint,
  error,
  optional,
  required,
  className = "",
}: {
  id: string;
  name: string;
  legend: ReactNode;
  options: readonly ChipOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  hint?: ReactNode;
  error?: ReactNode;
  optional?: boolean;
  required?: boolean;
  className?: string;
}) {
  const controlled = value !== undefined;
  return (
    <fieldset
      role="radiogroup"
      aria-labelledby={`${id}-legend`}
      aria-describedby={describedBy(id, { hint, error })}
      aria-invalid={error ? true : undefined}
      aria-required={required ? true : undefined}
      className={className}
    >
      <legend id={`${id}-legend`} className="type-small mb-1.5 font-semibold text-ink">
        {legend}
        {optional && <span className="font-normal text-ink-2"> (optional)</span>}
      </legend>
      <FieldHint id={id}>{hint}</FieldHint>
      <div className="flex flex-wrap gap-2">
        {options.map((o, i) => (
          <label key={o.value} className="relative inline-flex cursor-pointer">
            <input
              type="radio"
              id={`${id}-${i}`}
              name={name}
              value={o.value}
              required={required && i === 0 ? true : undefined}
              className="peer absolute inset-0 m-0 size-full cursor-pointer opacity-0"
              {...(controlled ? { checked: value === o.value, onChange: () => onChange?.(o.value) } : { defaultChecked: defaultValue === o.value })}
            />
            <span className="type-small inline-flex min-h-11 items-center rounded-field border border-line bg-frost px-4 text-ink transition-colors peer-checked:border-pine peer-checked:bg-pine peer-checked:font-bold peer-checked:text-white peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus peer-focus-visible:outline-solid">
              {o.label}
            </span>
          </label>
        ))}
      </div>
      <FieldError id={id}>{error}</FieldError>
    </fieldset>
  );
}

/** A checkbox with its label; the label makes the whole row the touch target. */
export function Checkbox({
  id,
  label,
  error,
  className = "",
  ...input
}: { id: string; label: ReactNode; error?: ReactNode; className?: string } & Omit<ComponentProps<"input">, "id" | "type" | "className">) {
  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 size-6 shrink-0 cursor-pointer accent-pine"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...input}
        />
        <label htmlFor={id} className="type-small min-h-11 cursor-pointer text-ink">
          {label}
        </label>
      </div>
      <FieldError id={id}>{error}</FieldError>
    </div>
  );
}
