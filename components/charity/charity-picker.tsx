"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart } from "lucide-react";
import { selectCharity } from "@/lib/actions/charity";
import { MAX_CHARITY_PERCENTAGE, MIN_CHARITY_PERCENTAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Charity } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

/** Charity chooser with contribution percentage (10–100%). */
export function CharityPicker({
  charities,
  selectedCharityId,
  currentPercentage,
}: {
  charities: Charity[];
  selectedCharityId: string | null;
  currentPercentage: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(selectedCharityId);
  const [percentage, setPercentage] = useState(String(currentPercentage));
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  function onSave() {
    setMessage(null);
    if (!selectedId) {
      setMessage({ kind: "error", text: "Choose a charity first." });
      return;
    }
    const pct = Number(percentage);
    if (!Number.isInteger(pct) || pct < MIN_CHARITY_PERCENTAGE || pct > MAX_CHARITY_PERCENTAGE) {
      setMessage({
        kind: "error",
        text: `Contribution must be a whole number between ${MIN_CHARITY_PERCENTAGE}% and ${MAX_CHARITY_PERCENTAGE}%.`,
      });
      return;
    }
    startTransition(async () => {
      const result = await selectCharity({ charity_id: selectedId, charity_percentage: pct });
      if (result.ok) {
        setMessage({ kind: "success", text: result.message ?? "Charity saved." });
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.error });
      }
    });
  }

  return (
    <div className="space-y-4">
      {message ? (
        <Alert variant={message.kind === "error" ? "error" : "success"}>
          {message.text}
        </Alert>
      ) : null}

      <ul role="list" className="divide-y divide-ink-100 border-y border-ink-100">
        {charities.map((charity) => {
          const active = selectedId === charity.id;
          return (
            <li key={charity.id}>
              <button
                type="button"
                onClick={() => setSelectedId(charity.id)}
                aria-pressed={active}
                className={cn(
                  "flex w-full items-start gap-3 px-2 py-3 text-left transition-colors hover:bg-ink-50",
                  active && "bg-brand-50/60"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                    active
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-ink-300 bg-white"
                  )}
                  aria-hidden
                >
                  {active ? <Check className="size-3.5" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink-900">
                    {charity.name}
                  </span>
                  {charity.description ? (
                    <span className="mt-0.5 block truncate text-sm text-ink-500">
                      {charity.description}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="grid gap-4 sm:grid-cols-[180px_auto] sm:items-start">
        <Field
          label="Contribution"
          htmlFor="charity-percentage"
          hint={`Of your subscription · min ${MIN_CHARITY_PERCENTAGE}%`}
        >
          <div className="relative">
            <Input
              id="charity-percentage"
              type="number"
              inputMode="numeric"
              min={MIN_CHARITY_PERCENTAGE}
              max={MAX_CHARITY_PERCENTAGE}
              step={1}
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="pr-8"
              required
            />
            <span
              className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-ink-400"
              aria-hidden
            >
              %
            </span>
          </div>
        </Field>
        <div className="sm:pt-[26px]">
          <Button onClick={onSave} loading={pending} type="button">
            <Heart className="size-4" aria-hidden />
            Save charity
          </Button>
        </div>
      </div>
    </div>
  );
}
