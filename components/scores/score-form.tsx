"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { addScore } from "@/lib/actions/scores";
import { MAX_SCORE, MIN_SCORE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

/** Form for recording a new Stableford score (1–45, one per date). */
export function ScoreForm({ maxDate }: { maxDate?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [score, setScore] = useState("");
  const [date, setDate] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const scoreNum = Number(score);
    if (!Number.isInteger(scoreNum) || scoreNum < MIN_SCORE || scoreNum > MAX_SCORE) {
      setError(`Score must be a whole number between ${MIN_SCORE} and ${MAX_SCORE}.`);
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError("Choose the date you played.");
      return;
    }

    startTransition(async () => {
      const result = await addScore({ score: scoreNum, score_date: date });
      if (result.ok) {
        setSuccess(result.message ?? "Score saved.");
        setScore("");
        setDate("");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error ? <Alert variant="error">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-[160px_180px_auto] sm:items-start">
        <Field
          label="Stableford score"
          htmlFor="score-value"
          hint={`${MIN_SCORE}–${MAX_SCORE} points`}
        >
          <Input
            id="score-value"
            type="number"
            inputMode="numeric"
            min={MIN_SCORE}
            max={MAX_SCORE}
            step={1}
            placeholder="e.g. 34"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            required
          />
        </Field>
        <Field label="Round date" htmlFor="score-date" hint="One score per date">
          <Input
            id="score-date"
            type="date"
            max={maxDate}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </Field>
        <div className="sm:pt-[26px]">
          <Button type="submit" loading={pending}>
            <Plus className="size-4" aria-hidden />
            Add score
          </Button>
        </div>
      </div>
    </form>
  );
}
