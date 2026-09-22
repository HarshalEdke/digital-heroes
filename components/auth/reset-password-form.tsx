"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { PasswordInput } from "@/components/auth/password-input";

export function ResetPasswordForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "" },
  });

  async function onSubmit(values: ResetPasswordValues) {
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });
    if (error) {
      if (error.message.includes("same as the old")) {
        setFormError("Your new password must be different from the old one.");
      } else {
        setFormError("Could not update the password. Please try again.");
      }
      return;
    }
    setSaved(true);
    setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
    }, 1200);
  }

  return (
    <form
      onSubmit={(event) => {
        // Belt-and-braces: never let a native form submission become a
        // full-page request.
        event.preventDefault();
        void handleSubmit(onSubmit)(event);
      }}
      className="space-y-4"
      noValidate
    >
      {formError ? <Alert variant="error">{formError}</Alert> : null}
      {saved ? (
        <Alert variant="success" title="Password updated">
          Redirecting you to your dashboard…
        </Alert>
      ) : null}
      <Field
        label="New password"
        htmlFor="password"
        errorId="password-error"
        error={errors.password?.message}
        hint="At least 8 characters, with letters and numbers."
      >
        <PasswordInput
          id="password"
          autoComplete="new-password"
          invalid={!!errors.password}
          {...register("password")}
        />
      </Field>
      <Button type="submit" className="w-full" loading={isSubmitting}>
        Update password
      </Button>
    </form>
  );
}
