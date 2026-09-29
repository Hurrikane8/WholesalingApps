export type SinkKind = "seller_lead" | "buyer_signup" | "opt_out";

/**
 * A durable home for a record: somewhere Kane can find it later. Leads,
 * signups and opt-outs go to every sink that accepts their kind, in parallel.
 */
export interface Sink {
  /** "airtable", "webhook:1", "owner-email" */
  name: string;
  kinds: SinkKind[];
  /** Resolves once the record is stored; throws on failure. */
  send(kind: SinkKind, record: unknown): Promise<void>;
}
