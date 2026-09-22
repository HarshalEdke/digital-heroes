import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Status badge with a colored dot plus text, so state never relies on color
 * alone.
 */
export function StatusBadge({
  status,
  className,
}: {
  status: string | null | undefined;
  className?: string;
}) {
  const value = (status ?? "unknown").toLowerCase();

  const tone: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    published: "bg-blue-50 text-blue-700 border-blue-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    pending_verification: "bg-amber-50 text-amber-700 border-amber-200",
    pending_payout: "bg-amber-50 text-amber-700 border-amber-200",
    simulated: "bg-sky-50 text-sky-700 border-sky-200",
    draft: "bg-ink-100 text-ink-700 border-ink-200",
    inactive: "bg-ink-100 text-ink-600 border-ink-200",
    cancelled: "bg-ink-100 text-ink-600 border-ink-200",
    expired: "bg-ink-100 text-ink-600 border-ink-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    past_due: "bg-red-50 text-red-700 border-red-200",
  };

  const label = value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        tone[value] ?? "bg-ink-100 text-ink-600 border-ink-200",
        className
      )}
    >
      <span
        className="size-1.5 rounded-full bg-current opacity-70"
        aria-hidden
      />
      {label}
    </span>
  );
}

/** Simple key/value row used across dashboards. */
export function InfoRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="text-sm font-medium text-ink-900 text-right">
        {children}
      </dd>
    </div>
  );
}

/** Section container used for unframed full-width bands. */
export function Band({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("w-full border-b border-ink-100", className)}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
  );
}
