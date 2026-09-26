import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buyerAirtableFields, buyerSchema, handleBuyerRequest, toBuyer } from "@/lib/buyers";
import { resetRateLimit } from "@/lib/delivery";
import { jsonRequest, ok, sentBody } from "./helpers";

const valid = {
  name: "Casey Investor",
  email: "casey@example.org",
  phone: "587 555 0144",
  company: "Northside Holdings",
  strategies: ["Flip", "BRRRR"],
  propertyTypes: ["Condo townhouse", "Half duplex"],
  targetAreas: ["Millwoods", "NE Edmonton"],
  financing: ["Cash"],
  maxPrice: 325000,
  maxReno: 60000,
  maxCondoFee: 450,
  dealsLast12Months: 3,
  proofOfFunds: true,
  notes: "Prefer 3 bed",
  consent: true,
  page: "/investors",
  startedAt: 0,
};

const request = (body: unknown) => jsonRequest("/api/buyers", body);

beforeEach(() => {
  resetRateLimit();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("buyerSchema", () => {
  it("requires consent", () => {
    const result = buyerSchema.safeParse({ ...valid, consent: false });
    expect(result.success).toBe(false);
  });

  it("only accepts choices that exist in Airtable", () => {
    expect(buyerSchema.safeParse({ ...valid, targetAreas: ["Mill Woods"] }).success).toBe(false);
    expect(buyerSchema.safeParse({ ...valid, strategies: ["Wholesale / JV"] }).success).toBe(true);
  });

  it("accepts the minimum fields", () => {
    expect(buyerSchema.safeParse({ name: "Al", email: "al@example.org", phone: "7805550100", consent: true }).success).toBe(true);
  });
});

describe("buyerAirtableFields", () => {
  it("maps a signup onto the Buyers table with a CASL consent record", () => {
    const buyer = toBuyer(buyerSchema.parse(valid), "ua");
    const fields = buyerAirtableFields(buyer, new Date("2026-09-26T18:00:00Z"));
    expect(fields).toMatchObject({
      "Buyer Name": "Casey Investor (Northside Holdings)",
      Phone: "(587) 555-0144",
      Email: "casey@example.org",
      Tier: "Warm",
      Source: "Website",
      "Financing Type": ["Cash"],
      Strategy: ["Flip", "BRRRR"],
      "Property Types": ["Condo townhouse", "Half duplex"],
      "Target Areas": ["Millwoods", "NE Edmonton"],
      "Max Purchase Price": 325000,
      "Max Reno Budget": 60000,
      "Max Condo Fee": 450,
      "Proof of Funds": "Claimed",
      "Deals Bought Last 12 Mo": 3,
      "CASL Consent": "Express",
      "Next Follow-Up": "2026-09-26",
    });
    expect(fields.Notes).toContain("CASL express consent given");
    expect(fields.Notes).toContain("Prefer 3 bed");
  });

  it("marks buyers without criteria as Cold", () => {
    const buyer = toBuyer(buyerSchema.parse({ name: "Al", email: "al@example.org", phone: "7805550100", consent: true }), "ua");
    expect(buyerAirtableFields(buyer)).toMatchObject({ Tier: "Cold", "Proof of Funds": "Unknown" });
  });
});

describe("handleBuyerRequest", () => {
  it("creates a Buyers record in Airtable", async () => {
    const fetchImpl = vi.fn(ok('{"records":[{"id":"rec1"}]}'));
    const env = { AIRTABLE_TOKEN: "pat_test", AIRTABLE_BASE_ID: "appTEST1234567890" };
    const res = await handleBuyerRequest(request(valid), { env, fetchImpl, now: 10_000 });
    expect(res.status).toBe(200);
    expect(sentBody(fetchImpl).records[0].fields["Buyer Name"]).toContain("Casey");
  });

  it("returns a consent error without it", async () => {
    const res = await handleBuyerRequest(request({ ...valid, consent: false }), { env: {}, now: 10_000 });
    expect(res.status).toBe(400);
    expect((await res.json()).fieldErrors).toHaveProperty("consent");
  });

  it("drops honeypot submissions silently", async () => {
    const fetchImpl = vi.fn(ok());
    const res = await handleBuyerRequest(request({ ...valid, website: "x" }), { env: { LEAD_WEBHOOK_URL: "https://a.test" }, fetchImpl, now: 10_000 });
    expect(res.status).toBe(200);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
