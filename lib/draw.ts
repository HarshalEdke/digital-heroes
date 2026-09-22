import { PRIZE_SPLIT, type MatchTier } from "@/lib/constants";

/**
 * Pure draw logic. Used only by server code (admin actions, webhook-free).
 * Keeping it side-effect free makes the prize calculation testable and
 * guarantees the client never influences draw outcomes.
 */

export type DrawNumbers = [number, number, number, number, number];

/** Generates 5 unique random numbers in the 1–45 range, sorted ascending. */
export function generateDrawNumbers(): DrawNumbers {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  // Fisher–Yates partial shuffle.
  for (let i = 0; i < 5; i++) {
    const j = i + Math.floor(Math.random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 5).sort((a, b) => a - b) as DrawNumbers;
}

/** Validates that five numbers form a legal draw result. */
export function isValidDrawNumbers(
  numbers: (number | null)[]
): numbers is DrawNumbers {
  return (
    numbers.length === 5 &&
    numbers.every(
      (n) => n !== null && Number.isInteger(n) && n >= 1 && n <= 45
    ) &&
    new Set(numbers).size === 5
  );
}

/**
 * Counts how many of the drawn numbers appear in the user's entry numbers.
 * Each entry number can match at most once.
 */
export function countMatches(
  entryNumbers: number[],
  drawNumbers: DrawNumbers
): number {
  const remaining = [...entryNumbers];
  let matches = 0;
  for (const drawn of drawNumbers) {
    const idx = remaining.indexOf(drawn);
    if (idx !== -1) {
      remaining.splice(idx, 1);
      matches++;
    }
  }
  return matches;
}

export function tierForMatches(matches: number): MatchTier | null {
  if (matches >= 5) return "five";
  if (matches === 4) return "four";
  if (matches === 3) return "three";
  return null;
}

export type PrizeCalculation = {
  /** Matched entries: user id, tier and equal-split prize amount (floor-rounded). */
  winners: { userId: string; tier: MatchTier; amount: number }[];
  /** Pot for the 5-number tier (40% + carried jackpot). */
  potFive: number;
  potFour: number;
  potThree: number;
  /** Carries to the next draw when nobody matches five. */
  rollover: number;
};

/**
 * Server-side prize allocation. Tiers split 40/35/25 of the pool; the carried
 * jackpot is added to the 5-number pot. If a tier has no winners, its pot is
 * not redistributed (the 5-number pot rolls over to the next draw).
 */
export function calculatePrizes(
  entries: { userId: string; numbers: number[] }[],
  drawNumbers: DrawNumbers,
  prizePool: number,
  carriedJackpot: number
): PrizeCalculation {
  const pots: Record<MatchTier, number> = {
    five: Math.floor(prizePool * PRIZE_SPLIT.five) + Math.max(0, carriedJackpot),
    four: Math.floor(prizePool * PRIZE_SPLIT.four),
    three: Math.floor(prizePool * PRIZE_SPLIT.three),
  };

  const winnersByTier: Record<MatchTier, string[]> = {
    five: [],
    four: [],
    three: [],
  };

  for (const entry of entries) {
    const matches = countMatches(entry.numbers, drawNumbers);
    const tier = tierForMatches(matches);
    if (tier) winnersByTier[tier].push(entry.userId);
  }

  const winners: PrizeCalculation["winners"] = [];
  for (const tier of ["five", "four", "three"] as MatchTier[]) {
    const winnersInTier = winnersByTier[tier];
    if (winnersInTier.length === 0) continue;
    const share = Math.floor(pots[tier] / winnersInTier.length);
    for (const userId of winnersInTier) {
      if (share > 0) winners.push({ userId, tier, amount: share });
    }
  }

  return {
    winners,
    potFive: pots.five,
    potFour: pots.four,
    potThree: pots.three,
    rollover: winnersByTier.five.length === 0 ? pots.five : 0,
  };
}
