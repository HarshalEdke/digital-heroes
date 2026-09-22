"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireUser } from "@/lib/auth";
import {
  calculatePrizes,
  generateDrawNumbers,
  isValidDrawNumbers,
} from "@/lib/draw";
import { drawAdminSchema, proofSchema } from "@/lib/validation/app";
import {
  actionError,
  actionSuccess,
  safeDbError,
  type ActionResult,
} from "@/lib/actions/types";
import type { Draw } from "@/lib/database.types";

const DRAW_PATHS = ["/dashboard", "/draw", "/admin", "/admin/draws", "/admin/winners"];

function revalidateDrawPaths() {
  for (const path of DRAW_PATHS) revalidatePath(path);
}

function drawRowToNumbers(draw: Draw): (number | null)[] {
  return [draw.number_1, draw.number_2, draw.number_3, draw.number_4, draw.number_5];
}

/** Loads a user's latest 5 scores as their draw entry numbers. */
async function entryNumbersFor(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<number[]> {
  const { data: scores } = await supabase
    .from("scores")
    .select("score")
    .eq("user_id", userId)
    .order("score_date", { ascending: false })
    .limit(5);
  return ((scores ?? []) as { score: number | null }[])
    .map((s) => s.score)
    .filter((n): n is number => typeof n === "number");
}

/** The jackpot carried into a new draw: the last published draw's rollover. */
async function carriedJackpot(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<number> {
  const { data: last } = await supabase
    .from("draws")
    .select("id, status, jackpot_amount, number_1, number_2, number_3, number_4, number_5")
    .in("status", ["published", "completed"])
    .order("draw_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!last) return 0;

  const { data: fiveWinners } = await supabase
    .from("winners")
    .select("id")
    .eq("draw_id", last.id)
    .eq("match_type", "five")
    .limit(1);

  // Jackpot carries only when the previous draw had no 5-number winner.
  if (fiveWinners && fiveWinners.length > 0) return 0;
  return last.jackpot_amount ?? 0;
}

/** Creates a draft draw. Admin-only. */
export async function createDraw(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = drawAdminSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid draw details.");
  }
  const { draw_date, draw_type, total_prize_pool } = parsed.data;
  let { jackpot_amount } = parsed.data;

  const supabase = await createClient();
  if (jackpot_amount === undefined) {
    jackpot_amount = await carriedJackpot(supabase);
  }

  const { error } = await supabase.from("draws").insert({
    draw_date,
    draw_type,
    status: "draft",
    total_prize_pool,
    jackpot_amount,
  });

  if (error) {
    return actionError(safeDbError(error, "Could not create the draw. Please try again."));
  }

  revalidateDrawPaths();
  return actionSuccess("Draw created as a draft.");
}

export type SimulationSummary = {
  numbers: number[];
  entries: number;
  five: number;
  four: number;
  three: number;
};

/**
 * Simulates a draw: generates the 5 winning numbers, builds draw entries from
 * every active subscriber's latest 5 scores, and validates the outcome —
 * without awarding prizes. Publishing requires a completed simulation.
 */
export async function simulateDraw(drawId: string): Promise<ActionResult<SimulationSummary>> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: draw, error: fetchError } = await supabase
    .from("draws")
    .select("*")
    .eq("id", drawId)
    .maybeSingle();

  if (fetchError || !draw) {
    return actionError("Draw not found.");
  }
  if (draw.status === "published" || draw.status === "completed") {
    return actionError("This draw has already been published.");
  }

  const numbers = generateDrawNumbers();

  // Participants: every active subscriber, entered with their latest 5 scores.
  const { data: subs, error: subsError } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("status", "active");

  if (subsError) {
    return actionError(safeDbError(subsError, "Could not load subscribers for the draw."));
  }

  const entries: { draw_id: string; user_id: string }[] = [];
  const entryNumbers: { userId: string; numbers: number[] }[] = [];

  for (const sub of (subs ?? []) as { user_id: string }[]) {
    const nums = await entryNumbersFor(supabase, sub.user_id);
    if (nums.length === 0) continue;
    entries.push({ draw_id: drawId, user_id: sub.user_id });
    entryNumbers.push({ userId: sub.user_id, numbers: nums });
  }

  // Rebuild entries from scratch so a re-simulation is idempotent.
  await supabase.from("draw_entries").delete().eq("draw_id", drawId);
  if (entries.length > 0) {
    const { error: entryError } = await supabase.from("draw_entries").insert(entries);
    if (entryError) {
      return actionError(safeDbError(entryError, "Could not create draw entries."));
    }
  }

  const { error: updateError } = await supabase
    .from("draws")
    .update({
      status: "simulated",
      number_1: numbers[0],
      number_2: numbers[1],
      number_3: numbers[2],
      number_4: numbers[3],
      number_5: numbers[4],
    })
    .eq("id", drawId);

  if (updateError) {
    return actionError(safeDbError(updateError, "Could not save the simulated numbers."));
  }

  const calc = calculatePrizes(
    entryNumbers,
    numbers,
    draw.total_prize_pool ?? 0,
    draw.jackpot_amount ?? 0
  );

  revalidateDrawPaths();
  return actionSuccess("Draw simulated. Review the outcome, then publish.", {
    numbers,
    entries: entries.length,
    five: calc.winners.filter((w) => w.tier === "five").length,
    four: calc.winners.filter((w) => w.tier === "four").length,
    three: calc.winners.filter((w) => w.tier === "three").length,
  });
}

/**
 * Publishes a simulated draw: recalculates matches and prizes server-side,
 * creates the winner rows, and marks the draw published. Requires a prior
 * successful simulation (status === "simulated" with valid numbers).
 */
export async function publishDraw(
  drawId: string
): Promise<ActionResult<{ winners: number; rollover: number }>> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: draw, error: fetchError } = await supabase
    .from("draws")
    .select("*")
    .eq("id", drawId)
    .maybeSingle();

  if (fetchError || !draw) {
    return actionError("Draw not found.");
  }
  if (draw.status === "published" || draw.status === "completed") {
    return actionError("This draw has already been published.");
  }
  if (draw.status !== "simulated") {
    return actionError("Simulate the draw before publishing it.");
  }

  const numbers = drawRowToNumbers(draw);
  if (!isValidDrawNumbers(numbers)) {
    return actionError("This draw has no valid numbers. Simulate it first.");
  }

  const { data: entryRows, error: entryError } = await supabase
    .from("draw_entries")
    .select("user_id")
    .eq("draw_id", drawId);

  if (entryError) {
    return actionError(safeDbError(entryError, "Could not load draw entries."));
  }

  const entries: { userId: string; numbers: number[] }[] = [];
  for (const row of (entryRows ?? []) as { user_id: string }[]) {
    const nums = await entryNumbersFor(supabase, row.user_id);
    if (nums.length > 0) entries.push({ userId: row.user_id, numbers: nums });
  }

  if (entries.length === 0) {
    return actionError(
      "No participants with scores were found. Cannot publish an empty draw."
    );
  }

  const calc = calculatePrizes(
    entries,
    numbers,
    draw.total_prize_pool ?? 0,
    draw.jackpot_amount ?? 0
  );

  if (calc.winners.length > 0) {
    const rows = calc.winners.map((w) => ({
      draw_id: drawId,
      user_id: w.userId,
      match_type: w.tier,
      prize_amount: w.amount,
      verification_status: "pending",
      payout_status: "pending",
    }));
    const { error: winnersError } = await supabase.from("winners").insert(rows);
    if (winnersError) {
      return actionError(safeDbError(winnersError, "Could not record the winners."));
    }
  }

  const { error: updateError } = await supabase
    .from("draws")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      // Unclaimed 5-number pot is recorded so the next draw can carry it.
      jackpot_amount: calc.rollover > 0 ? calc.rollover : (draw.jackpot_amount ?? 0),
    })
    .eq("id", drawId);

  if (updateError) {
    return actionError(safeDbError(updateError, "Could not publish the draw."));
  }

  revalidateDrawPaths();
  return actionSuccess(
    calc.rollover > 0
      ? "Draw published. No 5-number winner — the jackpot rolls over to the next draw."
      : "Draw published and winners recorded.",
    { winners: calc.winners.length, rollover: calc.rollover }
  );
}

/** Marks a published draw as completed. */
export async function completeDraw(drawId: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("draws")
    .update({ status: "completed" })
    .eq("id", drawId)
    .eq("status", "published");

  if (error) {
    return actionError(safeDbError(error, "Could not complete the draw."));
  }

  revalidateDrawPaths();
  return actionSuccess("Draw marked as completed.");
}

/** Deletes a draft/simulated draw. Published draws are kept for the audit trail. */
export async function deleteDraw(drawId: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("draws")
    .delete()
    .eq("id", drawId)
    .in("status", ["draft", "simulated"]);

  if (error) {
    return actionError(safeDbError(error, "Could not delete the draw."));
  }

  revalidateDrawPaths();
  return actionSuccess("Draw deleted.");
}

/** Submits a proof URL for one of the signed-in user's own winnings. */
export async function submitProof(
  winnerId: string,
  input: unknown
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = proofSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Enter a valid proof URL.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("winners")
    .update({
      proof_url: parsed.data.proof_url,
      verification_status: "pending",
    })
    .eq("id", winnerId)
    .eq("user_id", user.id);

  if (error) {
    return actionError(safeDbError(error, "Could not submit your proof. Please try again."));
  }

  revalidatePath("/winnings");
  revalidatePath("/admin/winners");
  revalidatePath("/admin");
  return actionSuccess("Proof submitted — awaiting verification.");
}
