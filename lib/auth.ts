import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/database.types";

/**
 * Server-side auth helpers. These are the single source of truth for route
 * protection and role authorization — never rely on client-side checks.
 */

export async function getSessionUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) return null;
  return user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("[auth] getProfile failed:", error.message);
    return null;
  }
  return data;
}

function fullNameFromMetadata(user: User): string {
  const metadata = user.user_metadata as Record<string, unknown> | null;
  const value =
    metadata && typeof metadata.full_name === "string" ? metadata.full_name : "";
  return value.trim();
}

/**
 * Creates the profiles record for a signed-in user if it does not exist yet
 * (e.g. the database trigger from the migration has not been applied).
 * The insert relies on the "insert own profile" RLS policy.
 */
export async function ensureProfile(user: User): Promise<Profile | null> {
  const existing = await getProfile(user.id);
  if (existing) return existing;

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email,
      full_name: fullNameFromMetadata(user),
      role: "user",
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) {
    // A concurrent insert (e.g. by the DB trigger) is fine — read it back.
    if (error.code === "23505") return getProfile(user.id);
    console.error("[auth] ensureProfile failed:", error.message);
    return null;
  }
  return data;
}

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/** Enforces the admin role server-side. Non-admins never see admin pages. */
export async function requireAdmin(): Promise<{ user: User; profile: Profile }> {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  if (!profile || profile.role !== "admin") redirect("/dashboard");
  return { user, profile };
}

/** Best-effort display name for UI chrome. */
export function displayName(user: User, profile?: Profile | null): string {
  const fromProfile = profile?.full_name?.trim();
  if (fromProfile) return fromProfile;
  const fromMetadata = fullNameFromMetadata(user);
  if (fromMetadata) return fromMetadata;
  return user.email ?? "Account";
}
