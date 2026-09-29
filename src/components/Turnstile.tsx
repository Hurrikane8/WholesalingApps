"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let loading: Promise<void> | undefined;
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile failed to load"));
    document.head.appendChild(script);
  });
  return loading;
}

/**
 * Cloudflare Turnstile's invisible check (spec 8.3), off by default: renders
 * nothing unless NEXT_PUBLIC_TURNSTILE_SITE_KEY is set. It only shows a
 * challenge if Cloudflare needs one. `onToken` gets each new token ("" when
 * it expires); the form sends it as `turnstileToken`.
 */
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  useEffect(() => {
    callback.current = onToken;
  });

  useEffect(() => {
    if (!SITE_KEY || !container.current) return;
    let id: string | undefined;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !container.current || !window.turnstile) return;
        id = window.turnstile.render(container.current, {
          sitekey: SITE_KEY,
          appearance: "interaction-only",
          "refresh-expired": "auto",
          callback: (token: string) => callback.current(token),
          "expired-callback": () => callback.current(""),
        });
      })
      .catch(() => {
        // Without the script the server check fails the token; the form then asks to retry or call.
      });
    return () => {
      cancelled = true;
      if (id && window.turnstile) window.turnstile.remove(id);
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={container} className="mt-4" />;
}
