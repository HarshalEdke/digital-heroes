import { AppHeader } from "@/components/layout/app-header";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { ensureProfile, requireUser } from "@/lib/auth";
import type { ReactNode } from "react";

/**
 * Server-enforced protection: the proxy refreshes the session and redirects
 * guests, but every authenticated page also re-checks the user here. The
 * profile row is created on first visit if the DB trigger has not run yet.
 */
export default async function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const user = await requireUser();
  await ensureProfile(user);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-ink-50">
      <AppHeader>
        <DashboardNav />
      </AppHeader>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
