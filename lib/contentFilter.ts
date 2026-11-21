/**
 * Basic content filter for user-generated submissions.
 * Blocks slurs, hate speech triggers, and sexually explicit terms
 * to comply with Google AdSense publisher content policies.
 *
 * This is a first line of defence — human mod review still happens
 * before confessions are approved.
 */

const BLOCKED_PATTERNS: RegExp[] = [
  // Racial/ethnic slurs (common patterns, not exhaustive)
  /\bn[i1!]+gg[ae3]+r/i,
  /\bch[i1]nk/i,
  /\bsp[i1]c/i,
  /\bk[i1]ke/i,
  /\bgook/i,
  /\bwetback/i,
  /\bcoon\b/i,
  /\bzip+?erhead/i,

  // Homophobic / transphobic slurs
  /\bf[a4]+g+[o0]+t/i,
  /\bd[y]+ke\b/i,

  // Explicit sexual content
  /\bp[o0]rn/i,
  /\bs[e3]x\s*(act|tape|video)/i,
  /\bfuck(ing)?\s+[a-z]+/i,

  // Violence / threats
  /\b(kill|murder|rape|stab|shoot)\s+(your?self|him|her|them|you)\b/i,
  /\bi('ll|will)\s+(kill|hurt|rape|stab|shoot)\b/i,

  // Self-harm promotion
  /\b(how\s+to\s+)?(commit\s+)?suicide\b/i,
  /\bkill\s+my?self\b/i,
  /\bcut\s+my?self\b/i,
]

export interface FilterResult {
  blocked: boolean
  reason?: string
}

export function filterContent(text: string): FilterResult {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return {
        blocked: true,
        reason: 'Your confession contains language that violates our community guidelines and cannot be posted.',
      }
    }
  }
  return { blocked: false }
}
