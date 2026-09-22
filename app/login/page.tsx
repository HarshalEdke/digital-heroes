import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Digital Heroes account.",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { next, error } = await searchParams;
  const safeNext =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/dashboard";

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to track scores, manage your charity, and join the monthly draw."
      footer={
        <>
          New to Digital Heroes?{" "}
          <Link
            href="/signup"
            className="font-medium text-brand-700 hover:text-brand-800"
          >
            Create an account
          </Link>
        </>
      }
    >
      {error === "auth" ? (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          That sign-in link is invalid or has expired. Log in again to continue.
        </p>
      ) : null}
      <LoginForm next={safeNext} />
    </AuthShell>
  );
}
