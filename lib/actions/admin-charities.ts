"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { charityAdminSchema } from "@/lib/validation/app";
import {
  actionError,
  actionSuccess,
  safeDbError,
  type ActionResult,
} from "@/lib/actions/types";

const CHARITY_PATHS = ["/charity", "/charities", "/admin/charities", "/admin", "/admin/reports"];

function revalidateCharityPaths() {
  for (const path of CHARITY_PATHS) revalidatePath(path);
}

/** Creates a charity. Admin-only. */
export async function createCharity(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = charityAdminSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid charity details.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("charities").insert({
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    image_url: parsed.data.image_url ?? null,
    events: parsed.data.events ?? null,
    is_active: true,
    is_featured: false,
  });

  if (error) {
    return actionError(safeDbError(error, "Could not create the charity."));
  }

  revalidateCharityPaths();
  return actionSuccess("Charity created.");
}

/** Updates a charity's editable fields. Admin-only. */
export async function updateCharity(
  charityId: string,
  input: unknown
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = charityAdminSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid charity details.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("charities")
    .update({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      image_url: parsed.data.image_url ?? null,
      events: parsed.data.events ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", charityId);

  if (error) {
    return actionError(safeDbError(error, "Could not update the charity."));
  }

  revalidateCharityPaths();
  return actionSuccess("Charity updated.");
}

/** Activates or deactivates a charity. Admin-only. */
export async function setCharityActive(
  charityId: string,
  active: boolean
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("charities")
    .update({ is_active: active, updated_at: new Date().toISOString() })
    .eq("id", charityId);

  if (error) {
    return actionError(safeDbError(error, "Could not change the charity status."));
  }

  revalidateCharityPaths();
  return actionSuccess(active ? "Charity activated." : "Charity deactivated.");
}

/** Sets a charity's featured flag. Admin-only. */
export async function setCharityFeatured(
  charityId: string,
  featured: boolean
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("charities")
    .update({ is_featured: featured, updated_at: new Date().toISOString() })
    .eq("id", charityId);

  if (error) {
    return actionError(safeDbError(error, "Could not change the featured flag."));
  }

  revalidateCharityPaths();
  return actionSuccess(featured ? "Charity featured." : "Charity unfeatured.");
}
