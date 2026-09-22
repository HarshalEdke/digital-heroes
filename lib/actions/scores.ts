"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { MAX_RETAINED_SCORES } from "@/lib/constants";
import { scoreSchema } from "@/lib/validation/app";
import {
  actionError,
  actionSuccess,
  safeDbError,
  type ActionResult,
} from "@/lib/actions/types";

const SCORE_PATHS = ["/dashboard", "/scores", "/draw"];

function revalidateScorePaths() {
  for (const path of SCORE_PATHS) revalidatePath(path);
}

/**
 * Adds a Stableford score for the signed-in user.
 *
 * Business rules enforced here (server-side, never in the client):
 * - score must be an integer 1–45 on a valid date;
 * - one score per user per date (app check + unique-violation safety net);
 * - only the latest 5 scores are retained — inserting a 6th removes the
 *   oldest (no archive table exists in the schema, so removal is a delete).
 */
export async function addScore(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = scoreSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid score.");
  }
  const { score, score_date } = parsed.data;

  const supabase = await createClient();

  // Duplicate-date guard (works with or without a DB unique constraint).
  const { data: existing } = await supabase
    .from("scores")
    .select("id")
    .eq("user_id", user.id)
    .eq("score_date", score_date)
    .maybeSingle();
  if (existing) {
    return actionError(
      "You already have a score recorded for this date. Edit that score instead."
    );
  }

  const { error: insertError } = await supabase
    .from("scores")
    .insert({ user_id: user.id, score, score_date });

  if (insertError) {
    if (insertError.code === "23505") {
      return actionError(
        "You already have a score recorded for this date. Edit that score instead."
      );
    }
    return actionError(safeDbError(insertError, "Could not save your score. Please try again."));
  }

  // Retain only the latest 5 scores: delete anything older than the newest 5.
  const { data: retained } = await supabase
    .from("scores")
    .select("id")
    .eq("user_id", user.id)
    .order("score_date", { ascending: false })
    .range(MAX_RETAINED_SCORES, MAX_RETAINED_SCORES + 50);

  if (retained && retained.length > 0) {
    const staleIds = retained.map((row) => row.id);
    await supabase.from("scores").delete().in("id", staleIds).eq("user_id", user.id);
    revalidateScorePaths();
    return actionSuccess(
      "Score saved. Your oldest score was removed to keep your latest 5."
    );
  }

  revalidateScorePaths();
  return actionSuccess("Score saved.");
}

/** Edits one of the user's own scores (score value and/or date). */
export async function updateScore(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = scoreSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid score.");
  }
  const { score, score_date } = parsed.data;

  const supabase = await createClient();

  const { data: clash } = await supabase
    .from("scores")
    .select("id")
    .eq("user_id", user.id)
    .eq("score_date", score_date)
    .neq("id", id)
    .maybeSingle();
  if (clash) {
    return actionError(
      "You already have a score recorded for this date. Edit that score instead."
    );
  }

  const { error } = await supabase
    .from("scores")
    .update({ score, score_date, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    if (error.code === "23505") {
      return actionError(
        "You already have a score recorded for this date. Edit that score instead."
      );
    }
    return actionError(safeDbError(error, "Could not update your score. Please try again."));
  }

  revalidateScorePaths();
  return actionSuccess("Score updated.");
}

/** Deletes one of the user's own scores. */
export async function deleteScore(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("scores")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return actionError(safeDbError(error, "Could not delete your score. Please try again."));
  }

  revalidateScorePaths();
  return actionSuccess("Score deleted.");
}
