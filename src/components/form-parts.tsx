/** Small pieces shared by the seller and investor forms. */

/** Hidden from people (and screen readers), irresistible to bots. */
export function Honeypot({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
      <label htmlFor={`${id}-website`}>Website</label>
      <input
        id={`${id}-website`}
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm text-red-600">
      {message}
    </p>
  );
}
