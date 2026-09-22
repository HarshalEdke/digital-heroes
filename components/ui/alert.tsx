import { AlertCircle, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type AlertVariant = "error" | "success" | "info";

const styles: Record<AlertVariant, { box: string; icon: ReactNode }> = {
  error: {
    box: "border-red-200 bg-red-50 text-red-800",
    icon: <AlertCircle className="size-4 shrink-0" aria-hidden />,
  },
  success: {
    box: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: <Check className="size-4 shrink-0" aria-hidden />,
  },
  info: {
    box: "border-ink-200 bg-ink-50 text-ink-800",
    icon: <Info className="size-4 shrink-0" aria-hidden />,
  },
};

export function Alert({
  variant = "info",
  title,
  children,
  className,
}: {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const style = styles[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn("flex gap-2.5 rounded-md border p-3 text-sm", style.box, className)}
    >
      {style.icon}
      <div className="min-w-0">
        {title ? <p className="font-medium">{title}</p> : null}
        {children ? <div className="[&_p]:mt-0.5">{children}</div> : null}
      </div>
    </div>
  );
}
