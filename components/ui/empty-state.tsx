import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Consistent empty state: icon + title + message + optional action. */
export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-10 text-center",
        className
      )}
    >
      <Icon className="size-8 text-ink-300" aria-hidden />
      <p className="mt-3 text-sm font-medium text-ink-800">{title}</p>
      {message ? (
        <p className="mt-1 max-w-sm text-sm text-ink-500">{message}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
