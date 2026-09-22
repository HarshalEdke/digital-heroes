"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/auth-errors";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { PasswordInput } from "@/components/auth/password-input";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState<string | null>(
    null
  );
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    setResent(false);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        if (error.code === "email_not_confirmed") {
          setNeedsConfirmation(values.email);
          setFormError(friendlyAuthError(error.code, error.message));
        } else {
          setFormError(friendlyAuthError(error.code, error.message));
        }
        return;
      }
      router.replace(next);
      router.refresh();
    } catch (error) {
      console.error("Login failed:", error);
      setFormError("Unable to log in right now. Please try again.");
    }
  }

  async function resendConfirmation() {
    if (!needsConfirmation) return;
    setResendError(null);
    setResending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: needsConfirmation,
      });
      if (error) {
        setResendError(friendlyAuthError(error.code, error.message));
      } else {
        setResent(true);
      }
    } catch {
      setResendError("Could not resend the email right now. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        // Belt-and-braces: never let a native form submission become a
        // full-page GET (which would put the password in the URL).
        event.preventDefault();
        void handleSubmit(onSubmit)(event);
      }}
      className="space-y-4"
      noValidate
    >
      {formError ? <Alert variant="error">{formError}</Alert> : null}

      {resent ? (
        <Alert variant="success" title="Confirmation email sent">
          Check the inbox (and spam folder) for{" "}
          <span className="font-medium">{needsConfirmation}</span>. The link
          expires in 24 hours.
        </Alert>
      ) : null}

      {needsConfirmation && !resent ? (
        <div className="rounded-lg border border-ink-200 bg-ink-50 p-4 text-sm">
          <p className="font-medium text-ink-900">
            Didn&apos;t get the email?
          </p>
          <p className="mt-1 text-ink-500">
            We can send the confirmation link to{" "}
            <span className="font-medium text-ink-900">
              {needsConfirmation}
            </span>{" "}
            again.
          </p>
          {resendError ? (
            <p className="mt-2 text-red-700" role="alert">
              {resendError}
            </p>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-3"
            loading={resending}
            onClick={resendConfirmation}
          >
            <Mail className="size-4" aria-hidden />
            Resend confirmation email
          </Button>
        </div>
      ) : null}

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

      <Field
        label="Password"
        htmlFor="password"
        errorId="password-error"
        error={errors.password?.message}
      >
        <PasswordInput
          id="password"
          autoComplete="current-password"
          invalid={!!errors.password}
          {...register("password")}
        />
      </Field>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Log in
      </Button>
    </form>
  );
}
