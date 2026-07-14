// Fast, cheap keyword/pattern check for acute risk (self-harm intent,
// physical safety threats, immediate danger) — no LLM call. See
// docs/content-reference.md §7. This is a routing decision only, not a
// diagnostic tool, and is intentionally conservative (favors false
// positives over missed disclosures).

const RISK_PATTERNS: RegExp[] = [
  // Self-harm intent
  /\bkill(ing)? myself\b/i,
  /\bsuicid(e|al)\b/i,
  /\bend(ing)? my (own )?life\b/i,
  /\bwant(ed)? to die\b/i,
  /\bdon'?t want to (live|be alive)\b/i,
  /\bbetter off dead\b/i,
  /\bno reason to live\b/i,
  /\b(hurt|harm|cutting|cut) (myself|me)\b/i,
  /\bself[- ]harm\b/i,

  // Physical safety threats / immediate danger from another person
  /\b(going to|gonna|will|might) kill me\b/i,
  /\bthreaten(ed|ing)? to kill me\b/i,
  /\bafraid (for|of) my life\b/i,
  /\bhas a (gun|knife|weapon)\b/i,
  /\bpulled a (gun|knife|weapon)\b/i,
  /\b(choked|strangled|punched|beat|beating) me\b/i,
  /\bhit me\b/i,
  /\bhurt(ing)? me physically\b/i,
  /\bnot safe\b/i,
  /\bin (immediate )?danger\b/i,
  /\bscared (he|she|they)('?s| is| are)? going to (hurt|kill) me\b/i,
];

export function screenForRisk(freeTextNotes: string[]): boolean {
  const combined = freeTextNotes.filter(Boolean).join(" \n ");
  if (!combined.trim()) return false;
  return RISK_PATTERNS.some((pattern) => pattern.test(combined));
}
