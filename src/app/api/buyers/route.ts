import { handleBuyerRequest } from "@/lib/buyers";

export async function POST(request: Request) {
  return handleBuyerRequest(request);
}
