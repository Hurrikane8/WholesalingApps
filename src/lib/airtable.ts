/**
 * Minimal Airtable REST client for creating CRM records from the website.
 * Needs AIRTABLE_TOKEN (a personal access token with the data.records:write
 * scope on your base) and AIRTABLE_BASE_ID.
 */
import { airtable } from "@/config/airtable";
import type { Env, Fetch } from "@/lib/delivery";

type Fields = Record<string, unknown>;

export function airtableConfigured(env: Env): boolean {
  return Boolean(env.AIRTABLE_TOKEN && env.AIRTABLE_BASE_ID);
}

/** Today's date (YYYY-MM-DD) in the business's time zone, for date fields. */
export function todayInMarket(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: airtable.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Removes empty values so Airtable only receives fields we actually have. */
export function compact(fields: Fields): Fields {
  return Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)),
  );
}

/**
 * Works out which field Airtable rejected from a 422 error, e.g.
 *   Unknown field name: "Foo"
 *   Field "Foo" cannot accept the provided value
 *   Insufficient permissions to create new select option ""Website""
 */
export function rejectedField(errorBody: string, fields: Fields): string | undefined {
  let message = errorBody;
  try {
    message = JSON.parse(errorBody)?.error?.message ?? errorBody;
  } catch {
    // not JSON; use the raw text
  }
  const named = message.match(/(?:Unknown field name|Field)\s*:?\s*"+([^"]+)"+/i)?.[1];
  if (named && named in fields) return named;
  const option = message.match(/select option\s*"+([^"]+)"+/i)?.[1];
  if (option) {
    return Object.keys(fields).find((k) => {
      const v = fields[k];
      return v === option || (Array.isArray(v) && v.includes(option));
    });
  }
  return undefined;
}

/**
 * Creates one record. If Airtable rejects a field (renamed field, missing
 * select option…), that field is dropped, its value is appended to the notes
 * field, and the request is retried, so the lead is still saved.
 */
export async function createAirtableRecord(opts: {
  table: string;
  fields: Fields;
  /** Fields that must never be dropped (the primary field). */
  required: string[];
  notesField: string;
  env: Env;
  fetchImpl: Fetch;
}): Promise<{ id: string; dropped: string[] }> {
  const { table, required, notesField, env, fetchImpl } = opts;
  const url = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`;
  let fields = compact(opts.fields);
  const dropped: string[] = [];

  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ records: [{ fields }], typecast: true }),
      signal: AbortSignal.timeout(8000),
    });
    const body = await res.text().catch(() => "");

    if (res.ok) {
      if (dropped.length) {
        console.warn(
          `[airtable] Saved to "${table}" without ${dropped.map((d) => `"${d}"`).join(", ")} (moved to ${notesField}). Update src/config/airtable.ts or the field/options in Airtable.`,
        );
      }
      let id = "";
      try {
        id = JSON.parse(body)?.records?.[0]?.id ?? "";
      } catch {
        // ignore
      }
      return { id, dropped };
    }

    const field = res.status === 422 ? rejectedField(body, fields) : undefined;
    if (!field || required.includes(field)) throw new Error(`airtable responded ${res.status}: ${body}`);

    const value = fields[field];
    const { [field]: _removed, ...rest } = fields; // eslint-disable-line @typescript-eslint/no-unused-vars
    fields = rest;
    dropped.push(field);
    if (field !== notesField && notesField in fields) {
      fields[notesField] = `${fields[notesField]}\n${field}: ${Array.isArray(value) ? value.join(", ") : String(value)}`;
    }
  }
  throw new Error(`airtable kept rejecting the record for "${table}"`);
}
