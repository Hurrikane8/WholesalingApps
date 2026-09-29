import fs from "node:fs";
import path from "node:path";

/**
 * Reads the `verified` flags from src/config/site.ts without compiling
 * TypeScript, so plain Node scripts (scan-build) know which claims are
 * confirmed. tests/claims.test.ts checks the result matches site.verified.
 *
 * @param {string} [root] repository root
 * @returns {Record<string, boolean>}
 */
export function readVerifiedFlags(root = process.cwd()) {
  const source = fs.readFileSync(path.join(root, "src/config/site.ts"), "utf8");
  const block = source.match(/\nconst verified\b[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (!block) throw new Error("Couldn't find `const verified = { … };` in src/config/site.ts");
  /** @type {Record<string, boolean>} */
  const flags = {};
  for (const m of block[1].matchAll(/^\s*(\w+)\s*:\s*(true|false)\s*,/gm)) flags[m[1]] = m[2] === "true";
  if (Object.keys(flags).length === 0) throw new Error("No flags found in site.verified");
  return flags;
}

/**
 * Reads `site.disclosure` from src/config/site.ts, so scan-build can check
 * that it appears on the pages spec 9 lists. tests/claims.test.ts checks the
 * result matches site.disclosure.
 *
 * @param {string} [root] repository root
 * @returns {string}
 */
export function readDisclosure(root = process.cwd()) {
  const source = fs.readFileSync(path.join(root, "src/config/site.ts"), "utf8");
  const match = source.match(/\n\s*disclosure:\s*\n?\s*"((?:[^"\\]|\\.)*)"/);
  if (!match) throw new Error('Couldn\'t find `disclosure: "…"` in src/config/site.ts');
  return match[1].replace(/\\"/g, '"');
}
