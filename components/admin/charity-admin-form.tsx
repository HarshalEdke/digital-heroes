"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Star, StarOff, Power } from "lucide-react";
import {
  createCharity,
  setCharityActive,
  setCharityFeatured,
  updateCharity,
} from "@/lib/actions/admin-charities";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import type { Charity } from "@/lib/database.types";

/** Create / edit form plus active/featured toggles for admin charities. */
export function CharityAdminForm({ charity }: { charity?: Charity }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [name, setName] = useState(charity?.name ?? "");
  const [description, setDescription] = useState(charity?.description ?? "");
  const [imageUrl, setImageUrl] = useState(charity?.image_url ?? "");
  const [events, setEvents] = useState(charity?.events ?? "");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    if (name.trim().length < 2) {
      setMessage({ kind: "error", text: "Enter the charity name." });
      return;
    }
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      image_url: imageUrl.trim() || undefined,
      events: events.trim() || undefined,
    };
    startTransition(async () => {
      const result = charity
        ? await updateCharity(charity.id, payload)
        : await createCharity(payload);
      if (result.ok) {
        setMessage({ kind: "success", text: result.message ?? "Saved." });
        if (!charity) {
          setName("");
          setDescription("");
          setImageUrl("");
          setEvents("");
        }
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.error });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {message ? (
        <Alert variant={message.kind === "error" ? "error" : "success"}>
          {message.text}
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor={`charity-name-${charity?.id ?? "new"}`}>
          <Input
            id={`charity-name-${charity?.id ?? "new"}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            required
          />
        </Field>
        <Field label="Image URL" htmlFor={`charity-image-${charity?.id ?? "new"}`}>
          <Input
            id={`charity-image-${charity?.id ?? "new"}`}
            type="url"
            placeholder="https://…"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </Field>
      </div>
      <Field
        label="Description"
        htmlFor={`charity-description-${charity?.id ?? "new"}`}
      >
        <Input
          id={`charity-description-${charity?.id ?? "new"}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
        />
      </Field>
      <Field
        label="Events"
        htmlFor={`charity-events-${charity?.id ?? "new"}`}
        hint="Comma-separated list"
      >
        <Input
          id={`charity-events-${charity?.id ?? "new"}`}
          value={events}
          onChange={(e) => setEvents(e.target.value)}
          maxLength={1000}
        />
      </Field>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={pending}>
          {charity ? <Save className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
          {charity ? "Save changes" : "Create charity"}
        </Button>
        {charity ? (
          <>
            <Button
              type="button"
              variant="secondary"
              loading={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await setCharityActive(charity.id, !charity.is_active);
                  setMessage(
                    result.ok
                      ? { kind: "success", text: result.message ?? "Updated." }
                      : { kind: "error", text: result.error }
                  );
                  router.refresh();
                })
              }
            >
              <Power className="size-4" aria-hidden />
              {charity.is_active ? "Deactivate" : "Activate"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              loading={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await setCharityFeatured(charity.id, !charity.is_featured);
                  setMessage(
                    result.ok
                      ? { kind: "success", text: result.message ?? "Updated." }
                      : { kind: "error", text: result.error }
                  );
                  router.refresh();
                })
              }
            >
              {charity.is_featured ? (
                <StarOff className="size-4" aria-hidden />
              ) : (
                <Star className="size-4" aria-hidden />
              )}
              {charity.is_featured ? "Unfeature" : "Feature"}
            </Button>
          </>
        ) : null}
      </div>
    </form>
  );
}
