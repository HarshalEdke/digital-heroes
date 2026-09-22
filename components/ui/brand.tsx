import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";
import type { ComponentProps } from "react";

/** Brand wordmark. Sized via the text classes on `className`. */
export function Brand({
  className,
  iconClassName,
  ...props
}: ComponentProps<"span"> & { iconClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)} {...props}>
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-md bg-brand-600 text-white",
          iconClassName
        )}
        aria-hidden
      >
        <Trophy className="size-4.5" />
      </span>
      <span className="text-lg font-semibold text-current">
        Digital&nbsp;Heroes
      </span>
    </span>
  );
}
