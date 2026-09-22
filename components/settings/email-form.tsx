"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changeEmail } from "@/lib/actions/settings";
import { emailSchema, type EmailValues } from "@/lib/validation/settings";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

/**
 * Requests an email change via the changeEmail server action. Supabase
 * emails a confirmation link to the new address; the address shown above
 * only changes once that link is clicked.
 */
export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [message, setMessage] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: currentEmail },
  });

  async function onSubmit(values: EmailValues) {
    setMessage(null);
    const result = await changeEmail(values);
    if (result.ok) {
      setMessage({
        kind: "success",
        text:
          result.message ??
          "Check your inbox to confirm the change. This may take a few minutes.",
      });
      reset({ email: currentEmail });
    } else {
      setMessage({ kind: "error", text: result.error });
    }
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
      {message ? (
        <Alert variant={message.kind === "error" ? "error" : "success"}>
          {message.text}
        </Alert>
      ) : null}
      <Field
        label="Email address"
        htmlFor="email"
        errorId="email-error"
        error={errors.email?.message}
        hint="Used to sign in. We send a confirmation link before applying a change."
      >
        <Input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          invalid={!!errors.email}
          {...register("email")}
        />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
          Update email
        </Button>
      </div>
    </form>
  );
}
