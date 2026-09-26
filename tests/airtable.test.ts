import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { compact, createAirtableRecord, rejectedField, todayInMarket } from "@/lib/airtable";
import { sentBody } from "./helpers";

const env = { AIRTABLE_TOKEN: "pat_test", AIRTABLE_BASE_ID: "appTEST1234567890" };
const error422 = (message: string) => () =>
  Promise.resolve(new Response(JSON.stringify({ error: { type: "X", message } }), { status: 422 }));
const created = () => Promise.resolve(new Response('{"records":[{"id":"recABC"}]}', { status: 200 }));

beforeEach(() => vi.spyOn(console, "warn").mockImplementation(() => {}));
afterEach(() => vi.restoreAllMocks());

describe("helpers", () => {
  it("drops empty values", () => {
    expect(compact({ a: "x", b: "", c: undefined, d: [], e: 0, f: ["y"] })).toEqual({ a: "x", e: 0, f: ["y"] });
  });

  it("formats today's date in Edmonton time", () => {
    expect(todayInMarket(new Date("2026-01-01T06:59:00Z"))).toBe("2025-12-31");
    expect(todayInMarket(new Date("2026-01-01T07:01:00Z"))).toBe("2026-01-01");
  });

  it("finds the rejected field in Airtable 422 errors", () => {
    const fields = { Name: "x", Tier: "Warm", Source: "Website", Areas: ["Leduc", "Beaumont"] };
    expect(rejectedField(JSON.stringify({ error: { message: 'Unknown field name: "Tier"' } }), fields)).toBe("Tier");
    expect(rejectedField(JSON.stringify({ error: { message: 'Field "Tier" cannot accept the provided value' } }), fields)).toBe("Tier");
    expect(rejectedField(JSON.stringify({ error: { message: 'Insufficient permissions to create new select option ""Website""' } }), fields)).toBe("Source");
    expect(rejectedField(JSON.stringify({ error: { message: 'Insufficient permissions to create new select option ""Beaumont""' } }), fields)).toBe("Areas");
    expect(rejectedField("gibberish", fields)).toBeUndefined();
  });
});

describe("createAirtableRecord", () => {
  const base = { table: "Buyers", required: ["Name"], notesField: "Notes", env };

  it("creates the record with typecast", async () => {
    const fetchImpl = vi.fn(created);
    const result = await createAirtableRecord({ ...base, fields: { Name: "Jo", Notes: "hi", Empty: "" }, fetchImpl });
    expect(result).toEqual({ id: "recABC", dropped: [] });
    expect(sentBody(fetchImpl)).toEqual({ records: [{ fields: { Name: "Jo", Notes: "hi" } }], typecast: true });
  });

  it("drops a rejected field, keeps its value in Notes and retries", async () => {
    const fetchImpl = vi.fn().mockImplementationOnce(error422('Insufficient permissions to create new select option ""Website""')).mockImplementationOnce(created);
    const result = await createAirtableRecord({ ...base, fields: { Name: "Jo", Source: "Website", Notes: "hi" }, fetchImpl });
    expect(result.dropped).toEqual(["Source"]);
    expect(sentBody(fetchImpl, 1).records[0].fields).toEqual({ Name: "Jo", Notes: "hi\nSource: Website" });
    expect(console.warn).toHaveBeenCalled();
  });

  it("gives up on non-422 errors and on the primary field", async () => {
    await expect(createAirtableRecord({ ...base, fields: { Name: "Jo" }, fetchImpl: vi.fn(() => Promise.resolve(new Response("", { status: 401 }))) })).rejects.toThrow(/401/);
    await expect(createAirtableRecord({ ...base, fields: { Name: "Jo" }, fetchImpl: vi.fn(error422('Unknown field name: "Name"')) })).rejects.toThrow(/422/);
  });
});
