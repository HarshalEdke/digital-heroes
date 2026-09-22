import { AppHeader } from "@/components/layout/app-header";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { ensureProfile, requireUser } from "@/lib/auth";
import type { ReactNode } from "react";

/**
 * Shared authenticated chrome for all member pages (dashboard, scores,
 * charity, subscription, draw, winnings). Server-enforced protection: the
 * proxy redirects guests and every page re-checks the session here.
 */
export async function AppShell({ children }: { children: ReactNode }) {
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
