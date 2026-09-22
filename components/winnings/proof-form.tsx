"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { submitProof } from "@/lib/actions/draws";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

/**
 * Winner proof submission. The project has no storage bucket configured, so
 * winners submit a public proof URL (e.g. a hosted photo or scorecard link)
 * which admins review in the admin panel.
 */
export function ProofForm({ winnerId }: { winnerId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const value = url.trim();
    if (!/^https?:\/\/\S+$/.test(value)) {
      setMessage({ kind: "error", text: "Enter a valid http(s) URL." });
      return;
    }
    startTransition(async () => {
      const result = await submitProof(winnerId, { proof_url: value });
      if (result.ok) {
        setMessage({ kind: "success", text: result.message ?? "Proof submitted." });
        setUrl("");
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.error });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2" noValidate>
      {message ? (
        <Alert variant={message.kind === "error" ? "error" : "success"}>
          {message.text}
        </Alert>
      ) : null}
      <Field
        label="Proof URL"
        htmlFor={`proof-${winnerId}`}
        hint="Link to a photo of your scorecard or result"
      >
        <Input
          id={`proof-${winnerId}`}
          type="url"
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </Field>
      <Button type="submit" size="sm" loading={pending}>
        <Upload className="size-4" aria-hidden />
        Submit proof
      </Button>
    </form>
  );
}
