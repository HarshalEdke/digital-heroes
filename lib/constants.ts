/** Product-wide constants shared by server logic and UI. */

/** Stableford scores — and draw numbers — live in this range. */
export const MIN_SCORE = 1;
export const MAX_SCORE = 45;

/** Each user's latest 5 scores are kept (and form their draw entry). */
export const MAX_RETAINED_SCORES = 5;

/** Charity contribution bounds (percent of subscription). */
export const MIN_CHARITY_PERCENTAGE = 10;
export const MAX_CHARITY_PERCENTAGE = 100;

/** Prize allocation across the 5/4/3-number tiers (fractions of the pool). */
export const PRIZE_SPLIT = {
  five: 0.4,
  four: 0.35,
  three: 0.25,
} as const;

export type MatchTier = keyof typeof PRIZE_SPLIT;

export const MATCH_TIER_LABELS: Record<MatchTier, string> = {
  five: "5-number match",
  four: "4-number match",
  three: "3-number match",
};

export const DRAW_STATUSES = [
  "draft",
  "simulated",
  "published",
  "completed",
] as const;

export type DrawStatus = (typeof DRAW_STATUSES)[number];

export const SUBSCRIPTION_STATUSES = [
  "active",
  "inactive",
  "cancelled",
  "past_due",
  "expired",
] as const;

/** Plans priced in INR. Stripe price IDs come from env when configured. */
export const PLANS = {
  monthly: {
    id: "monthly",
    label: "Monthly",
    priceInr: 499,
    months: 1,
    description: "Full membership, billed every month.",
  },
  yearly: {
    id: "yearly",
    label: "Yearly",
    priceInr: 4999,
    months: 12,
    description: "Full membership, billed once a year — save 16%.",
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function isPlanId(value: unknown): value is PlanId {
  return value === "monthly" || value === "yearly";
}
