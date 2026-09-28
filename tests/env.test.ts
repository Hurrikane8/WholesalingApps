import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveSiteUrl } from "@/config/site";
import { deployEnv, isFinalDomain, isIndexable, showDrafts, showUnconfirmed } from "@/lib/env";
import { hasDurableSellerSink, hasOwnerAlert, launchFindings } from "@/lib/launch";
import { robotsFor } from "@/lib/seo";

const ENV_KEYS = [
  "VERCEL_ENV",
  "SITE_ENV",
  "SITE_INDEXABLE",
  "NEXT_PUBLIC_PREVIEW_UNCONFIRMED",
  "NEXT_PUBLIC_SITE_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL",
];

beforeEach(() => {
  for (const key of ENV_KEYS) vi.stubEnv(key, "");
});

afterEach(() => vi.unstubAllEnvs());

describe("resolveSiteUrl", () => {
  it("prefers NEXT_PUBLIC_SITE_URL, without trailing slashes", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", " https://www.aurorahomebuyers.ca// ");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "wholesaling-apps.vercel.app");
    expect(resolveSiteUrl()).toBe("https://www.aurorahomebuyers.ca");
  });

  it("falls back to Vercel's production address", () => {
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "wholesaling-apps.vercel.app");
    expect(resolveSiteUrl()).toBe("https://wholesaling-apps.vercel.app");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL", "other.vercel.app");
    expect(resolveSiteUrl()).toBe("https://other.vercel.app");
  });

  it("uses localhost when nothing is set", () => {
    expect(resolveSiteUrl()).toBe("http://localhost:3000");
  });
});

describe("isFinalDomain", () => {
  it.each([
    "https://wholesaling-apps.vercel.app",
    "https://aurora.netlify.app",
    "https://aurora.pages.dev",
    "https://aurora.onrender.com",
    "https://example.com",
    "https://www.example.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "not a url",
  ])("%s is not final", (url) => expect(isFinalDomain(url)).toBe(false));

  it.each(["https://www.aurorahomebuyers.ca", "https://aurorahomebuyers.com"])("%s is final", (url) => expect(isFinalDomain(url)).toBe(true));
});

describe("deployEnv", () => {
  it("reads VERCEL_ENV first, then SITE_ENV, then NODE_ENV", () => {
    vi.stubEnv("SITE_ENV", "preview");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(deployEnv()).toBe("production");
    vi.stubEnv("VERCEL_ENV", "");
    expect(deployEnv()).toBe("preview");
    vi.stubEnv("SITE_ENV", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(deployEnv()).toBe("production");
    vi.stubEnv("NODE_ENV", "test");
    expect(deployEnv()).toBe("development");
  });

  it("treats unknown values as development", () => {
    vi.stubEnv("SITE_ENV", "staging");
    expect(deployEnv()).toBe("development");
  });

  it("shows drafts and unconfirmed claims only outside production", () => {
    vi.stubEnv("NEXT_PUBLIC_PREVIEW_UNCONFIRMED", "true");
    vi.stubEnv("SITE_ENV", "preview");
    expect(showDrafts()).toBe(true);
    expect(showUnconfirmed()).toBe(true);
    vi.stubEnv("SITE_ENV", "production");
    expect(showDrafts()).toBe(false);
    expect(showUnconfirmed()).toBe(false);
  });
});

describe("isIndexable", () => {
  const live = "https://www.aurorahomebuyers.ca";

  it("is true only in production, on the real domain", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(isIndexable(live)).toBe(true);
    expect(isIndexable("https://wholesaling-apps.vercel.app")).toBe(false);
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(isIndexable(live)).toBe(false);
  });

  it("can be switched off with SITE_INDEXABLE=false", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("SITE_INDEXABLE", "false");
    expect(isIndexable(live)).toBe(false);
  });

  it("drives the robots meta tag", () => {
    expect(robotsFor(false, false)).toEqual({ index: false, follow: false });
    expect(robotsFor(true, false)).toEqual({ index: false, follow: false });
    expect(robotsFor(false, true)).toBeUndefined();
    expect(robotsFor(true, true)).toEqual({ index: false, follow: true });
  });
});

describe("launch guard (spec 4.10)", () => {
  const ready = {
    AIRTABLE_TOKEN: "pat",
    AIRTABLE_BASE_ID: "app",
    NTFY_TOPIC_URL: "https://ntfy.sh/topic",
    NEXT_PUBLIC_SITE_URL: "https://www.aurorahomebuyers.ca",
  };

  it("passes with a durable sink, an owner alert and an https site URL", () => {
    expect(launchFindings(ready)).toEqual([]);
  });

  it("accepts a webhook as the sink and email or Quo as the alert", () => {
    expect(hasDurableSellerSink({ LEAD_WEBHOOK_URL: "https://hooks.example.test/x" })).toBe(true);
    expect(hasOwnerAlert({ RESEND_API_KEY: "re_x", LEAD_EMAIL_TO: "kane@test.invalid" })).toBe(true);
    expect(hasOwnerAlert({ QUO_API_KEY: "k", QUO_FROM_NUMBER: "+17805550100", QUO_NOTIFY_TO: "+17805550101" })).toBe(true);
    expect(hasOwnerAlert({ QUO_API_KEY: "k" })).toBe(false);
  });

  it("reports each missing piece", () => {
    expect(launchFindings({})).toHaveLength(3);
    expect(launchFindings({ ...ready, AIRTABLE_TOKEN: "" }).join()).toMatch(/sink/);
    expect(launchFindings({ ...ready, NTFY_TOPIC_URL: "" }).join()).toMatch(/alert/);
    expect(launchFindings({ ...ready, NEXT_PUBLIC_SITE_URL: "http://www.aurorahomebuyers.ca" }).join()).toMatch(/https/);
  });
});
