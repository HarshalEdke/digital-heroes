"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { deleteScore, updateScore } from "@/lib/actions/scores";
import { MAX_SCORE, MIN_SCORE } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { Score } from "@/lib/database.types";
import { Button, buttonClasses } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

type Feedback = { kind: "error" | "success"; text: string } | null;

/** Score history with inline edit and delete for the owner's rows. */
export function ScoreTable({ scores }: { scores: Score[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState("");
  const [editDate, setEditDate] = useState("");
  const [message, setMessage] = useState<Feedback>(null);

  function startEdit(score: Score) {
    setEditingId(score.id);
    setMessage(null);
    setEditScore(String(score.score ?? ""));
    setEditDate(score.score_date ?? "");
  }

  function saveEdit(id: string) {
    setMessage(null);
    const scoreNum = Number(editScore);
    if (!Number.isInteger(scoreNum) || scoreNum < MIN_SCORE || scoreNum > MAX_SCORE) {
      setMessage({ kind: "error", text: `Score must be between ${MIN_SCORE} and ${MAX_SCORE}.` });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(editDate)) {
      setMessage({ kind: "error", text: "Choose a valid date." });
      return;
    }
    startTransition(async () => {
      const result = await updateScore(id, { score: scoreNum, score_date: editDate });
      if (result.ok) {
        setEditingId(null);
        setMessage({ kind: "success", text: result.message ?? "Score updated." });
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.error });
      }
    });
  }

  function remove(id: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await deleteScore(id);
      if (result.ok) {
        setMessage({ kind: "success", text: result.message ?? "Score deleted." });
        router.refresh();
      } else {
        setMessage({ kind: "error", text: result.error });
      }
    });
  }

  return (
    <div className="space-y-3">
      {message ? (
        <Alert variant={message.kind === "error" ? "error" : "success"}>
          {message.text}
        </Alert>
      ) : null}

      <ul className="divide-y divide-ink-100" role="list">
        {scores.map((score, index) => {
          const isEditing = editingId === score.id;
          return (
            <li
              key={score.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              {isEditing ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    aria-label="Score"
                    type="number"
                    min={MIN_SCORE}
                    max={MAX_SCORE}
                    value={editScore}
                    onChange={(e) => setEditScore(e.target.value)}
                    className="w-24"
                  />
                  <Input
                    aria-label="Date"
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-40"
                  />
                  <Button size="sm" loading={pending} onClick={() => saveEdit(score.id)}>
                    <Check className="size-4" aria-hidden />
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="size-4" aria-hidden />
                    Cancel
                  </Button>
                </div>
              ) : (
                <ScoreRow
                  score={score}
                  index={index}
                  pending={pending}
                  onEdit={() => startEdit(score)}
                  onDelete={() => remove(score.id)}
                />
              )}
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-ink-500">
        Only your latest 5 scores are retained — adding a 6th removes the oldest.
        Your latest 5 are also your numbers in the{" "}
        <Link href="/draw" className="font-medium text-brand-700 hover:text-brand-800">
          monthly draw
        </Link>
        .
      </p>
    </div>
  );
}

function ScoreRow({
  score,
  index,
  pending,
  onEdit,
  onDelete,
}: {
  score: Score;
  index: number;
  pending: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const dateLabel = formatDate(score.score_date);
  return (
    <>
      <div className="flex items-center gap-4">
        <span className="flex size-10 items-center justify-center rounded-md bg-ink-50 text-lg font-semibold text-ink-900">
          {score.score ?? "—"}
        </span>
        <div>
          <p className="text-sm font-medium text-ink-900">{dateLabel}</p>
          <p className={index < 5 ? "text-xs text-ink-500" : "text-xs text-ink-400"}>
            {index < 5 ? "Counts towards your latest 5" : "Older score"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onEdit}
          className={buttonClasses("ghost", "sm", "px-2")}
          aria-label={`Edit score from ${dateLabel}`}
          title="Edit score"
        >
          <Pencil className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className={buttonClasses("ghost", "sm", "px-2 text-red-600 hover:bg-red-50")}
          aria-label={`Delete score from ${dateLabel}`}
          title="Delete score"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>
    </>
  );
}
