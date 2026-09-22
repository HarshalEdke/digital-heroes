import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

export function Label({
  className,
  htmlFor,
  children,
  ...props
}: ComponentProps<"label">) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("block text-sm font-medium text-ink-800", className)}
      {...props}
    >
      {children}
    </label>
  );
}

export function Input({
  className,
  invalid,
  ...props
}: ComponentProps<"input"> & { invalid?: boolean }) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border bg-white px-3 text-sm text-ink-900 placeholder:text-ink-400",
        "disabled:cursor-not-allowed disabled:bg-ink-50",
        invalid
          ? "border-red-400 focus:border-red-500"
          : "border-ink-300 focus:border-brand-500",
        className
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

/** Inline error message tied to an input via aria-describedby. */
export function FieldError({
  id,
  children,
}: {
  id: string;
  children?: ReactNode;
}) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1 text-xs text-red-600">
      <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

/** Vertical form field: label + control + error + optional hint. */
export function Field({
  label,
  htmlFor,
  error,
  errorId,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  errorId?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-ink-500">{hint}</p> : null}
      <FieldError id={errorId ?? htmlFor}>{error}</FieldError>
    </div>
  );
}
