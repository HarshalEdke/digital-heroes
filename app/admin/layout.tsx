import { AppHeader } from "@/components/layout/app-header";
import { AdminNav } from "@/components/layout/admin-nav";
import { requireAdmin } from "@/lib/auth";
import type { ReactNode } from "react";

/**
 * Admin panel chrome. requireAdmin() enforces the admin role server-side on
 * every admin route — non-admins are redirected to /dashboard before any
 * page or data loads.
 */
export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await requireAdmin();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-ink-50">
      <AppHeader>
        <AdminNav />
      </AppHeader>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
