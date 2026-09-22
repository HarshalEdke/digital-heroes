import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Brand } from "@/components/ui/brand";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Public site header. Shows Dashboard when a session exists. */
export async function SiteHeader({ className }: { className?: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header
      className={cn("border-b border-ink-100 bg-white/95 backdrop-blur", className)}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="text-ink-900 hover:text-brand-700 focus-visible:outline-brand-600"
          aria-label="Digital Heroes home"
        >
          <Brand />
        </Link>

        <nav aria-label="Main" className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/charities"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100 hover:text-ink-900 sm:block"
          >
            Charities
          </Link>
          {user ? (
            <ButtonLink href="/dashboard" size="sm">
              Dashboard
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login" variant="secondary" size="sm">
                Log in
              </ButtonLink>
              <ButtonLink href="/signup" size="sm">
                Sign up
              </ButtonLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-ink-100 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
        <Brand className="text-ink-500" iconClassName="bg-ink-200 text-ink-600" />
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/charities" className="text-ink-500 hover:text-ink-900">
            Charities
          </Link>
          <Link href="/signup" className="text-ink-500 hover:text-ink-900">
            Join
          </Link>
          <Link href="/login" className="text-ink-500 hover:text-ink-900">
            Log in
          </Link>
        </nav>
        <p className="text-xs text-ink-400">
          © {new Date().getFullYear()} Digital Heroes
        </p>
      </div>
    </footer>
  );
}

export function PageContainer({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>
      {children}
    </div>
  );
}
