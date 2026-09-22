"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import {
  actionError,
  actionSuccess,
  safeDbError,
  type ActionResult,
} from "@/lib/actions/types";

const WINNER_PATHS = ["/winnings", "/admin/winners", "/admin", "/dashboard"];

function revalidateWinnerPaths() {
  for (const path of WINNER_PATHS) revalidatePath(path);
}

/** Approves a winner's proof. Admin-only. */
export async function approveWinner(winnerId: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("winners")
    .update({
      verification_status: "approved",
      verified_at: new Date().toISOString(),
    })
    .eq("id", winnerId);

  if (error) {
    return actionError(safeDbError(error, "Could not approve the winner."));
  }

  revalidateWinnerPaths();
  return actionSuccess("Winner approved.");
}

/** Rejects a winner's proof. Admin-only. */
export async function rejectWinner(winnerId: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("winners")
    .update({
      verification_status: "rejected",
      verified_at: new Date().toISOString(),
    })
    .eq("id", winnerId);

  if (error) {
    return actionError(safeDbError(error, "Could not reject the winner."));
  }

  revalidateWinnerPaths();
  return actionSuccess("Winner rejected.");
}

/** Marks a verified winner's payout as paid. Admin-only. */
export async function markWinnerPaid(winnerId: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("winners")
    .update({
      payout_status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", winnerId);

  if (error) {
    return actionError(safeDbError(error, "Could not record the payout."));
  }

  revalidateWinnerPaths();
  return actionSuccess("Payout marked as paid.");
}
