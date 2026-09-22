"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings/password`,
    });
    if (error) {
      setFormError("Could not send the reset email. Please try again.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Alert
        variant="success"
        title="Reset link sent"
      >
        <p>
          If an account exists for that email, you&apos;ll receive a password
          reset link shortly. It expires after a short time for security.
        </p>
      </Alert>
    );
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
      <Field
        label="Email"
        htmlFor="email"
        errorId="email-error"
        error={errors.email?.message}
      >
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          invalid={!!errors.email}
          {...register("email")}
        />
      </Field>
      <Button type="submit" className="w-full" loading={isSubmitting}>
        Send reset link
      </Button>
    </form>
  );
}
