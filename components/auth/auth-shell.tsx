import Link from "next/link";
import { Brand } from "@/components/ui/brand";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Centered shell used by all auth pages. */
export function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-ink-50 px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center text-ink-900">
          <Link href="/" aria-label="Digital Heroes home">
            <Brand className="scale-110" />
          </Link>
        </div>
        <div className="rounded-lg border border-ink-200 bg-white p-6 sm:p-8">
          <h1 className="text-xl font-semibold text-ink-900">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-ink-500">{subtitle}</p>
          ) : null}
          <div className={cn("mt-6")}>{children}</div>
        </div>
        {footer ? (
          <div className="mt-4 text-center text-sm text-ink-500">{footer}</div>
        ) : null}
      </div>
    </main>
  );
}
