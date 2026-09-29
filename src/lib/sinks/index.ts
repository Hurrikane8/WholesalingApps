/**
 * Where records go (spec 4.3). getSinks() builds the list of durable sinks
 * from environment variables; deliver() sends a record to every sink that
 * accepts its kind, in parallel, with an 8-second limit each.
 *
 * Adding a CRM later (docs/integrations/README.md): write src/lib/sinks/<crm>.ts
 * implementing Sink, register it below behind its own environment variables,
 * and add tests. Nothing else changes.
 */
import { withTimeout, type Env, type Fetch } from "@/lib/delivery";
import { airtableSink } from "./airtable";
import { ownerEmailSink } from "./owner-email";
import type { Sink, SinkKind } from "./types";
import { webhookSinks } from "./webhook";

export type { Sink, SinkKind } from "./types";

export function getSinks(env: Env = process.env, fetchImpl: Fetch = fetch): Sink[] {
  return [airtableSink(env, fetchImpl), ...webhookSinks(env, fetchImpl), ownerEmailSink(env, fetchImpl)].filter(
    (sink): sink is Sink => sink !== null,
  );
}

export type DeliveryResult = { configured: number; delivered: string[]; failed: string[] };

/**
 * Sends one record to every sink for its kind. Failures are logged with the
 * record's ID only; the caller decides what to do when nothing succeeded.
 */
export async function deliver(
  kind: SinkKind,
  record: { id: string },
  { env = process.env, fetchImpl = fetch, sinks }: { env?: Env; fetchImpl?: Fetch; sinks?: Sink[] } = {},
): Promise<DeliveryResult> {
  const targets = (sinks ?? getSinks(env, fetchImpl)).filter((s) => s.kinds.includes(kind));
  const results = await Promise.allSettled(targets.map((s) => withTimeout(s.send(kind, record), undefined, s.name)));
  const delivered: string[] = [];
  const failed: string[] = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") delivered.push(targets[i].name);
    else {
      failed.push(targets[i].name);
      console.error(`[${kind}] ${targets[i].name} failed for ${record.id}: ${String(result.reason).slice(0, 300)}`);
    }
  });
  return { configured: targets.length, delivered, failed };
}
