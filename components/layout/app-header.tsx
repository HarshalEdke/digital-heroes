import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Brand } from "@/components/ui/brand";
import { displayName } from "@/lib/auth";
import type { ReactNode } from "react";

/**
 * Sign out via a server action so the auth cookie is cleared with server
 * privileges — no bearer tokens in the browser.
 */
async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** Authenticated app header with primary nav and account menu. */
export async function AppHeader({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name = user ? displayName(user) : "Account";
  const isAdmin =
    user &&
    (await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => data?.role === "admin"));

  return (
    <header className="border-b border-ink-100 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/dashboard" className="text-ink-900" aria-label="Dashboard home">
          <Brand />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {isAdmin ? (
            <Link
              href="/admin"
              className="rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100 hover:text-ink-900"
            >
              Admin
            </Link>
          ) : null}
          <span
            className="hidden max-w-48 truncate text-sm font-medium text-ink-700 sm:block"
            title={name}
          >
            {name}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-ink-300 bg-white px-3 text-sm font-medium text-ink-800 hover:bg-ink-50"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
      {children}
    </header>
  );
}
