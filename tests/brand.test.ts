import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BRAND } from "@/components/brand/colors";
import { formatMoney, roundTo } from "@/lib/format";
import { DISALLOWED_PATHS } from "@/app/robots";
import { footerNav, primaryNav, secondaryNav } from "@/config/nav";

const css = fs.readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

/** The value of a --color-* token in globals.css. */
function token(name: string): string | undefined {
  return css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1]?.toUpperCase();
}

describe("brand colours", () => {
  it.each([
    ["snow", BRAND.snow],
    ["frost", BRAND.frost],
    ["mist", BRAND.mist],
    ["ink", BRAND.ink],
    ["ink-2", BRAND.ink2],
    ["pine", BRAND.pine],
    ["night", BRAND.night],
    ["aurora-green", BRAND.auroraGreen],
    ["aurora-teal", BRAND.auroraTeal],
    ["aurora-violet", BRAND.auroraViolet],
  ])("colors.ts matches the %s token in globals.css", (name, hex) => {
    expect(token(name)).toBe(hex);
  });

  it("keeps the favicon in the brand palette", () => {
    const icon = fs.readFileSync(path.join(process.cwd(), "src/app/icon.svg"), "utf8").toUpperCase();
    for (const hex of [BRAND.snow, BRAND.ink, BRAND.auroraGreen, BRAND.auroraTeal, BRAND.auroraViolet]) expect(icon).toContain(hex);
  });
});

describe("design rules (spec 3.3, 3.10)", () => {
  const nav = [...primaryNav, ...secondaryNav, ...footerNav.flatMap((g) => g.links)];

  it("uses sentence case in navigation", () => {
    const properNouns = new Set(["Kane", "Edmonton", "Alberta", "Aurora"]);
    for (const { label } of nav) {
      const words = label.replace(/^Investors: /, "").split(/\s+/).slice(1);
      for (const word of words) if (!properNouns.has(word.replace(/\W/g, ""))) expect(word, label).not.toMatch(/^[A-Z][a-z]/);
    }
  });

  it("never appends arrows to link text", () => {
    for (const { label } of nav) expect(label).not.toMatch(/[→›»]|->/);
  });
});

describe("formatMoney", () => {
  it("formats CAD with a true minus sign", () => {
    expect(formatMoney(425_000)).toBe("$425,000");
    expect(formatMoney(-62_000)).toBe("−$62,000");
    expect(formatMoney(0)).toBe("$0");
    expect(formatMoney(-0.4)).toBe("$0");
  });

  it("rounds for prose", () => {
    expect(roundTo(22_300, 500)).toBe(22_500);
    expect(roundTo(22_240, 500)).toBe(22_000);
  });
});

describe("styleguide", () => {
  it("is kept out of search", () => {
    expect(DISALLOWED_PATHS).toContain("/styleguide");
    const sitemap = fs.readFileSync(path.join(process.cwd(), "src/app/sitemap.ts"), "utf8");
    expect(sitemap).not.toContain("/styleguide");
  });
});
