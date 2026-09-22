"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfile } from "@/lib/actions/settings";
import {
  profileSchema,
  type ProfileValues,
} from "@/lib/validation/settings";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

/** Edits the account's display name via the updateProfile server action. */
export function ProfileForm({ fullName }: { fullName: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName },
  });

  async function onSubmit(values: ProfileValues) {
    setMessage(null);
    const result = await updateProfile(values);
    if (result.ok) {
      setMessage({
        kind: "success",
        text: result.message ?? "Your details have been updated.",
      });
      router.refresh();
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
        label="Full name"
        htmlFor="full-name"
        errorId="full-name-error"
        error={errors.fullName?.message}
        hint="Shown in the app header and on your account."
      >
        <Input
          id="full-name"
          autoComplete="name"
          invalid={!!errors.fullName}
          {...register("fullName")}
        />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
