/**
 * Airtable CRM mapping — the "Wholesaling CRM" base.
 *
 * Website leads are written straight into your Seller Leads and Buyers tables
 * when AIRTABLE_TOKEN and AIRTABLE_BASE_ID are set (see .env.example).
 *
 * Field names must match your base exactly. If you rename a field in Airtable,
 * rename it here too. If a record is ever rejected (a renamed field, a missing
 * select option), the site retries with just the essentials — address/name,
 * phone, email and a Notes field containing everything — so a lead is never
 * lost, and logs a warning telling you to fix this mapping.
 *
 * Select values (Status, Timeline, Condition…) come from src/lib/lead-options.ts
 * and must match the choices in your select fields.
 */
export const airtable = {
  timeZone: "America/Edmonton",

  seller: {
    table: "Seller Leads",
    fields: {
      address: "Property Address", // primary field
      name: "Owner Name",
      phone: "Phone",
      email: "Email",
      status: "Status",
      source: "Source",
      propertyType: "Property Type",
      timeline: "Timeline",
      condition: "Condition",
      occupancy: "Occupancy",
      motivation: "Motivation",
      nextFollowUp: "Next Follow-Up",
      notes: "Notes",
    },
    /** New web leads land in your "Follow-up due" view the day they arrive. */
    defaults: {
      status: "New",
      source: "Inbound (web / phone / FB)",
    },
  },

  buyer: {
    table: "Buyers",
    fields: {
      name: "Buyer Name", // primary field
      phone: "Phone",
      email: "Email",
      tier: "Tier",
      source: "Source",
      financing: "Financing Type",
      strategy: "Strategy",
      propertyTypes: "Property Types",
      targetAreas: "Target Areas",
      maxPrice: "Max Purchase Price",
      maxReno: "Max Reno Budget",
      maxCondoFee: "Max Condo Fee",
      proofOfFunds: "Proof of Funds",
      dealsLast12Months: "Deals Bought Last 12 Mo",
      caslConsent: "CASL Consent",
      nextFollowUp: "Next Follow-Up",
      notes: "Notes",
    },
    defaults: {
      /**
       * Add a "Website" option to Buyers › Source in Airtable so signups are
       * tagged. Until then the record is saved via the essentials fallback.
       */
      source: "Website",
      /** "Warm = criteria known, not yet proven"; "Cold = name only". */
      tierWithCriteria: "Warm",
      tierWithoutCriteria: "Cold",
      /** They ticked the consent box on the form. */
      caslConsent: "Express",
      proofOfFundsClaimed: "Claimed",
      proofOfFundsUnknown: "Unknown",
    },
  },
} as const;
