"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { emailSchema, profileSchema } from "@/lib/validation/settings";
import {
  actionError,
  actionSuccess,
  safeDbError,
  type ActionResult,
} from "@/lib/actions/types";

/**
 * Updates the signed-in user's display name on the profiles row. RLS
 * restricts the update to the user's own row.
 */
export async function updateProfile(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid details.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return actionError(
      safeDbError(error, "Could not save your details. Please try again.")
    );
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return actionSuccess("Your details have been updated.");
}

/**
 * Requests an email change for the signed-in user. Supabase sends a
 * confirmation link to the new address (and a notice to the old one); the
 * change applies only after the link is clicked. The link lands on
 * /auth/callback, which signs the user back in.
 */
export async function changeEmail(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = emailSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(
      parsed.error.issues[0]?.message ?? "Invalid email address."
    );
  }
  const newEmail = parsed.data.email.toLowerCase();

  if (user.email && newEmail === user.email.toLowerCase()) {
    return actionError("That is already your email address.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email: newEmail });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("already registered")) {
      return actionError("That email address is already in use.");
    }
    if (message.includes("different")) {
      return actionError("Choose an email address different from the current one.");
    }
    return actionError("Could not start the email change. Please try again.");
  }

  revalidatePath("/settings");
  return actionSuccess(
    `A confirmation link was sent to ${newEmail}. The change applies once you click it.`
  );
}
