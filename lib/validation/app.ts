import { z } from "zod";
import {
  MAX_CHARITY_PERCENTAGE,
  MAX_SCORE,
  MIN_CHARITY_PERCENTAGE,
  MIN_SCORE,
} from "@/lib/constants";

/** Stableford score for a round on a given date. */
export const scoreSchema = z.object({
  score: z.coerce
    .number({ message: "Enter your Stableford score" })
    .int("Score must be a whole number")
    .min(MIN_SCORE, `Score must be between ${MIN_SCORE} and ${MAX_SCORE}`)
    .max(MAX_SCORE, `Score must be between ${MIN_SCORE} and ${MAX_SCORE}`),
  score_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date"),
});
export type ScoreValues = z.infer<typeof scoreSchema>;

/** Charity selection with contribution percentage (10–100%). */
export const charitySelectionSchema = z.object({
  charity_id: z.string().uuid("Choose a charity"),
  charity_percentage: z.coerce
    .number({ message: "Enter a contribution percentage" })
    .int("Use a whole number")
    .min(MIN_CHARITY_PERCENTAGE, `Minimum contribution is ${MIN_CHARITY_PERCENTAGE}%`)
    .max(MAX_CHARITY_PERCENTAGE, `Maximum contribution is ${MAX_CHARITY_PERCENTAGE}%`),
});
export type CharitySelectionValues = z.infer<typeof charitySelectionSchema>;

/** Winner proof submission — must be an http(s) URL. */
export const proofSchema = z.object({
  proof_url: z
    .string()
    .trim()
    .url("Enter a valid URL (https://…)")
    .max(2048, "URL is too long")
    .refine((v) => /^https?:\/\//i.test(v), "Only http(s) URLs are accepted"),
});
export type ProofValues = z.infer<typeof proofSchema>;

/* ---- Admin-facing schemas ---- */

export const charityAdminSchema = z.object({
  name: z.string().trim().min(2, "Enter the charity name").max(120, "Name is too long"),
  description: z.string().trim().max(2000, "Description is too long").optional(),
  image_url: z
    .string()
    .trim()
    .max(2048, "URL is too long")
    .optional()
    .transform((v) => (v ? v : undefined)),
  events: z.string().trim().max(1000, "Keep events under 1000 characters").optional(),
});
export type CharityAdminValues = z.infer<typeof charityAdminSchema>;

export const drawAdminSchema = z.object({
  draw_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid draw date"),
  draw_type: z.enum(["monthly", "special"]),
  total_prize_pool: z.coerce
    .number({ message: "Enter the prize pool" })
    .int("Use whole rupees")
    .min(0, "Prize pool cannot be negative")
    .max(100_000_000, "Prize pool is too large"),
  jackpot_amount: z.coerce
    .number()
    .int("Use whole rupees")
    .min(0, "Jackpot cannot be negative")
    .max(100_000_000, "Jackpot is too large")
    .optional(),
});
export type DrawAdminValues = z.infer<typeof drawAdminSchema>;
