"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

/** Password input with an accessible show/hide toggle. */
export const PasswordInput = forwardRef<
  HTMLInputElement,
  ComponentProps<"input"> & { invalid?: boolean }
>(function PasswordInput({ className, invalid, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        invalid={invalid}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-ink-400 hover:text-ink-700"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
      <span id={id} className="sr-only">
        Password visibility toggle
      </span>
    </div>
  );
});
