import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Allowed OTP verification types from email links. */
const OTP_TYPES = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

function safeNext(value: string | null, fallback: string): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return fallback;
}

/**
 * Shared handler for Supabase email-link callbacks.
 *
 * Supports both flows:
 * - PKCE `?code=...` (auth emails configured with a code exchange)
 * - `?token_hash=...&type=...` (default Supabase email templates)
 *
 * Recovery links land on /settings/password; everything else on /dashboard.
 */
export async function handleAuthCallback(
  request: Request
): Promise<NextResponse> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const fallback =
    type === "recovery" ? "/settings/password" : "/dashboard";
  const next = safeNext(url.searchParams.get("next"), fallback);
  const origin = url.origin;

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  } else if (tokenHash && type && OTP_TYPES.has(type)) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email",
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
