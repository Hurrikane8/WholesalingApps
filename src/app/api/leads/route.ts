import { handleLeadRequest } from "@/lib/leads";

export async function POST(request: Request) {
  return handleLeadRequest(request);
}
