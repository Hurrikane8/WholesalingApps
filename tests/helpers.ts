import { vi } from "vitest";

let ipCounter = 0;

export function jsonRequest(path: string, body: unknown, ip = `10.0.0.${++ipCounter}`) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip, "user-agent": "vitest" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

export const ok = (body = "{}") => () => Promise.resolve(new Response(body, { status: 200 }));
export const fail = () => Promise.resolve(new Response("nope", { status: 500 }));

/** The parsed JSON body of the nth fetch call. */
export function sentBody(fetchImpl: ReturnType<typeof vi.fn>, n = 0) {
  const [, init] = fetchImpl.mock.calls[n] as unknown as [string, RequestInit];
  return JSON.parse(String(init.body));
}

export function sentUrl(fetchImpl: ReturnType<typeof vi.fn>, n = 0): string {
  return (fetchImpl.mock.calls[n] as unknown as [string])[0];
}
