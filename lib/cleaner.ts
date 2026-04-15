/**
 * Text cleaning utilities.
 * Strips HTML tags, emojis, and promotional text so the LLM receives
 * clean, high-signal information.
 */

// Common promotional / spam phrases to remove
const PROMO_PATTERNS = [
  /subscribe\s*(to\s*(my|our|the))?\s*(channel|newsletter)?/gi,
  /like\s+and\s+share/gi,
  /click\s+(the\s+)?bell\s+(icon|button)/gi,
  /hit\s+the\s+(like|subscribe)\s+button/gi,
  /\bcheck\s+out\s+(my|our)\s+(website|channel|blog|course)\b/gi,
  /\buse\s+(code|coupon|promo)\b.{0,30}/gi,
  /\baffiliate\s+link\b/gi,
  /\bsponsored\s+by\b.{0,50}/gi,
  /\bsupport\s+(me|us)\s+on\s+patreon\b/gi,
  /\bfollow\s+(me|us)\s+on\s+(twitter|instagram|facebook|tiktok)\b/gi,
  /\bwatch\s+my\s+(other\s+)?video\b/gi,
  /\bjoin\s+(my|our)\s+(discord|community)\b/gi,
];

/**
 * Removes HTML tags from a string, preserving the inner text content.
 * Strips any residual `<` / `>` characters so no tag fragments remain.
 */
export function stripHtml(text: string): string {
  const withNewlines = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div|li|h[1-6])\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    // Remove any leftover angle-bracket fragments that could form tags
    .replace(/<[^>]*$/g, "")
    .replace(/^[^<]*>/g, "");

  // Decode HTML entities (single-pass, most-specific first to prevent double-decoding)
  return withNewlines
    .replace(/&amp;/g, "\u0026")   // & → &  (must come after other entity names)
    .replace(/&lt;/g, "\u003C")    // < (unicode escapes avoid the < literal)
    .replace(/&gt;/g, "\u003E")    // >
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/**
 * Removes emoji characters from a string.
 */
export function stripEmojis(text: string): string {
  return text
    // Surrogate pairs (emoji in the range U+1F000+)
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
    // BMP emoji and symbol ranges
    .replace(/[\u2600-\u27BF\uFE00-\uFE0F]/g, "")
    .replace(/[\u200D\u200B\u200C\uFEFF]/g, "");
}

/**
 * Removes common promotional phrases from text.
 */
export function stripPromotionalText(text: string): string {
  let cleaned = text;
  for (const pattern of PROMO_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }
  return cleaned;
}

/**
 * Normalises whitespace: collapses multiple spaces / newlines.
 */
export function normaliseWhitespace(text: string): string {
  return text
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Master cleaner: applies all cleaning steps in sequence.
 *
 * @param text - Raw text (possibly containing HTML, emojis, promo copy)
 * @returns Clean, high-signal text ready for embedding / LLM consumption
 */
export function cleanText(text: string): string {
  const steps = [
    stripHtml,
    stripEmojis,
    stripPromotionalText,
    normaliseWhitespace,
  ];

  return steps.reduce((acc, fn) => fn(acc), text);
}

/**
 * Cleans an array of text fields and returns the combined result.
 * Useful for merging title + description before embedding.
 */
export function cleanAndMerge(fields: string[]): string {
  return cleanText(fields.join(" "));
}
