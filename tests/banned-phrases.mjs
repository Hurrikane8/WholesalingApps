/**
 * Phrases and patterns the site must never publish (spec 2.3): vague sales
 * language and unverifiable track-record claims.
 *
 * Shared by tests/claims.test.ts (source and content) and scripts/scan-build.mjs
 * (the built HTML). It lives outside src/ and content/ so neither scan flags
 * the list itself. Matching is case-insensitive, after normalizing curly
 * apostrophes and HTML entities.
 */

/** @type {string[]} */
export const BANNED_PHRASES = [
  "fair cash offer",
  "fair offer",
  "fair price",
  "hassle",
  "hassle-free",
  "stress-free",
  "seamless",
  "we've helped",
  "I've helped",
  "thousands of homeowners",
  "trusted by",
  "#1",
  "number one",
  "best price",
  "top dollar",
  "guaranteed offer",
  "most often",
  "regularly buy",
  "we've seen it",
  "any situation",
  "our specialty",
  "most common reasons",
  "come to us",
  "often call us",
];

/** First-person track-record claims. */
export const BANNED_PATTERNS = [
  /\b(we|I)('ve| have) (helped|bought|seen|closed|worked with)\b/i,
  /\b(we|I) (buy|purchase)\b[^.]{0,40}\b(regularly|often|all the time|every (week|month))\b/i,
  /\b(common|normal|typical) purchase\b/i,
];

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * One regex per phrase, on word boundaries. "#1" ignores hex colours (#1a2b3c)
 * and in-page anchors such as href="#1-after-repair-value" or ](#1-…).
 */
const PHRASE_PATTERNS = BANNED_PHRASES.map((phrase) => {
  if (phrase === "#1") return { phrase, re: /(?<!["'(=/\\])#1(?![0-9a-f])/i };
  const start = /^\w/.test(phrase) ? "\\b" : "";
  const end = /\w$/.test(phrase) ? "\\b" : "";
  return { phrase, re: new RegExp(`${start}${escape(phrase)}${end}`, "i") };
});

/** Decodes the entities React and marked emit, and straightens apostrophes. */
export function normalizeText(text) {
  return text
    .replace(/&#x27;|&#39;|&apos;|&rsquo;|&lsquo;|[‘’]/g, "'")
    .replace(/&quot;|&#34;|&ldquo;|&rdquo;|[“”]/g, '"')
    .replace(/&nbsp;|&#160;| /g, " ")
    .replace(/&amp;/g, "&");
}

/**
 * Every banned phrase or pattern in `text`, with a snippet of context.
 * @param {string} text
 * @returns {{ rule: string, match: string, snippet: string }[]}
 */
export function findBanned(text) {
  const normalized = normalizeText(text);
  const hits = [];
  const rules = [
    ...PHRASE_PATTERNS.map(({ phrase, re }) => ({ rule: `"${phrase}"`, re })),
    ...BANNED_PATTERNS.map((re) => ({ rule: String(re), re })),
  ];
  for (const { rule, re } of rules) {
    const global = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
    for (const m of normalized.matchAll(global)) {
      const from = Math.max(0, m.index - 50);
      const snippet = normalized.slice(from, m.index + m[0].length + 50).replace(/\s+/g, " ").trim();
      hits.push({ rule, match: m[0], snippet });
    }
  }
  return hits;
}

/**
 * Promise text that may only appear once its flag in site.verified is true
 * (spec 11.3). scripts/scan-build.mjs checks production builds against these;
 * tests/claims.test.ts checks claims.ts output with every flag off. The gaps
 * stop at sentence ends and at the "¦" the scan puts between HTML blocks.
 */
export const PROMISE_PATTERNS = {
  closeInDays: [
    /\bclos(?:e|es|ed|ing)\b[^.!?¦<>]{0,40}?\b\d+\s*(?:business\s+)?days?\b/i,
    /\b\d+\s*(?:business\s+)?days?\b[^.!?¦<>]{0,30}?\bclos(?:e|es|ing)\b/i,
    /\bclos(?:e|es|ed|ing)\b[^.!?¦<>]{0,20}?\b(?:a|one|two)\s+weeks?\b/i,
    /\bas (?:little|soon) as \d+\s*days?\b/i,
  ],
  offerWithinHours: [/\b\d+(?:[ -]|\u00a0)?(?:business )?(?:hours?|hrs?)\b/i, /\bwithin (?:a|one|two|\d+) (?:business )?days?\b/i],
  coversLegalFees: [
    /\bI pay your standard legal fees\b/i,
    /\b(?:we|I)\s+(?:pay|cover)\b[^.!?¦<>]{0,30}\blegal fees\b/i,
    /\blegal fees\b[^.!?¦<>]{0,20}\b(?:covered|paid by (?:us|me))\b/i,
  ],
};

/**
 * Promise text in `text` whose flag is off.
 * @param {string} text
 * @param {Record<string, boolean>} verified site.verified
 * @returns {{ rule: string, match: string, snippet: string }[]}
 */
export function findUnverifiedPromises(text, verified) {
  const normalized = normalizeText(text);
  const hits = [];
  for (const [flag, patterns] of Object.entries(PROMISE_PATTERNS)) {
    if (verified[flag]) continue;
    for (const re of patterns) {
      for (const m of normalized.matchAll(new RegExp(re.source, `${re.flags}g`))) {
        const from = Math.max(0, m.index - 50);
        const snippet = normalized.slice(from, m.index + m[0].length + 50).replace(/\s+/g, " ").trim();
        hits.push({ rule: `${flag} is off: ${re}`, match: m[0], snippet });
      }
    }
  }
  return hits;
}
