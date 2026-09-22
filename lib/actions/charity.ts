"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { charitySelectionSchema } from "@/lib/validation/app";
import {
  actionError,
  actionSuccess,
  safeDbError,
  type ActionResult,
} from "@/lib/actions/types";

/**
 * Sets the signed-in user's selected charity and contribution percentage.
 * RLS restricts this update to the user's own profile row; the charity must
 * exist and be active. Minimum contribution (10%) is enforced by validation.
 */
export async function selectCharity(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = charitySelectionSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid selection.");
  }
  const { charity_id, charity_percentage } = parsed.data;

  const supabase = await createClient();

  const { data: charity } = await supabase
    .from("charities")
    .select("id, name, is_active")
    .eq("id", charity_id)
    .maybeSingle();

  if (!charity || !charity.is_active) {
    return actionError("That charity is not available. Please choose another.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      charity_id,
      charity_percentage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return actionError(
      safeDbError(error, "Could not save your charity selection. Please try again.")
    );
  }

  revalidatePath("/charity");
  revalidatePath("/dashboard");
  return actionSuccess(`You are now supporting ${charity.name} with ${charity_percentage}% of your subscription.`);
}

/** Clears the user's charity selection. */
export async function clearCharity(): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ charity_id: null, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    return actionError(safeDbError(error, "Could not clear your charity. Please try again."));
  }

  revalidatePath("/charity");
  revalidatePath("/dashboard");
  return actionSuccess("Charity selection cleared.");
}
