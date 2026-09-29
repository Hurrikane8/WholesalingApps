import { handleOptOutRequest } from "@/lib/optouts";

/** Opt-outs from letters and door hangers (spec 4.7). */
export async function POST(request: Request) {
  return handleOptOutRequest(request);
}
