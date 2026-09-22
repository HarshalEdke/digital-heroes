import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Set a new password",
};

/**
 * Arrived at from the email recovery link (via /auth/callback). The recovery
 * link signs the user in, so a session must exist here.
 */
export default async function ResetPasswordPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/settings/password");
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you haven't used elsewhere."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
