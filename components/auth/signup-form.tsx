"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/auth-errors";
import { signupSchema, type SignupValues } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { PasswordInput } from "@/components/auth/password-input";

export function SignupForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<string | null>(null);
  /** True while exactly one signup request is allowed in flight. */
  const inFlight = useRef(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  async function onSubmit(values: SignupValues) {
    // Guard against a second submission racing the first (e.g. a fast double
    // click on a touch screen). The submit button is also disabled while
    // isSubmitting, so normally only one request is ever created.
    if (inFlight.current) return;
    inFlight.current = true;
    setFormError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { full_name: values.fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) {
        setFormError(friendlyAuthError(error.code, error.message));
        return;
      }

      if (data.session) {
        // Email confirmation disabled: user is signed in immediately.
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      setEmailSent(values.email);
    } catch {
      console.error("Signup failed");
      setFormError("Unable to create your account right now. Please try again.");
    } finally {
      inFlight.current = false;
    }
  }

  if (emailSent) {
    return (
      <Alert variant="success" title="Check your email">
        <p>
          We sent a confirmation link to <strong>{emailSent}</strong>. Click it
          to verify your address and finish setting up your account.
        </p>
        <p className="mt-2 text-xs opacity-80">
          Didn&apos;t get it? Check your spam folder, or try logging in once
          you&apos;ve confirmed.
        </p>
      </Alert>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        // Belt-and-braces with the disabled submit button: a native form
        // submission must never reach the browser as a full-page request.
        event.preventDefault();
        void handleSubmit(onSubmit)(event);
      }}
      className="space-y-4"
      noValidate
    >
      {formError ? <Alert variant="error">{formError}</Alert> : null}

      <Field
        label="Full name"
        htmlFor="fullName"
        errorId="fullName-error"
        error={errors.fullName?.message}
      >
        <Input
          id="fullName"
          type="text"
          autoComplete="name"
          placeholder="e.g. Aarav Sharma"
          invalid={!!errors.fullName}
          {...register("fullName")}
        />
      </Field>

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
        <Check className="size-4" aria-hidden />
        Create account
      </Button>
    </form>
  );
}
