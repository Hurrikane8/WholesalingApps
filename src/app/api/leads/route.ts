import { after } from "next/server";
import { handleLeadRequest } from "@/lib/leads";

/** Seller leads (spec 4.2). Alerts and confirmations run after the response, via `after`. */
export async function POST(request: Request) {
  return handleLeadRequest(request, { defer: (task) => after(task) });
}
