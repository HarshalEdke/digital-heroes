import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { Score } from "@/lib/database.types";
import { ScoreForm } from "@/components/scores/score-form";
import { ScoreTable } from "@/components/scores/score-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Scores" };

export default async function ScoresPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: scores, error } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("score_date", { ascending: false })
    .limit(50);

  const list = (scores ?? []) as Score[];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-ink-500">Scores</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink-900 sm:text-3xl">
          Stableford scores
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Log a score after each round. Scores must be between 1 and 45, one
          per date, and only your latest 5 are kept.
        </p>
      </header>

      {error ? (
        <Alert variant="error" title="Could not load your scores">
          <p>Please refresh the page. If this keeps happening, try again later.</p>
        </Alert>
      ) : null}

      <section className="rounded-lg border border-ink-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-ink-900">Add a score</h2>
        <div className="mt-4">
          <ScoreForm />
        </div>
      </section>

      <section className="rounded-lg border border-ink-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-ink-900">Score history</h2>
        {list.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No scores yet"
            message="Add your first Stableford score above — your latest 5 become your monthly draw numbers."
          />
        ) : (
          <div className="mt-4">
            <ScoreTable scores={list} />
          </div>
        )}
      </section>
    </div>
  );
}