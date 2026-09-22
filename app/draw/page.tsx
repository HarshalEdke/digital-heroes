import type { Metadata } from "next";
import { Ticket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { Draw, Score } from "@/lib/database.types";
import { PRIZE_SPLIT, MATCH_TIER_LABELS } from "@/lib/constants";
import { formatDate, formatCurrency } from "@/lib/format";
import { DrawNumbers } from "@/components/draw/draw-numbers";
import { StatusBadge, InfoRow } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Monthly Draw" };

export default async function DrawPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [drawsResult, scoresResult] = await Promise.all([
    supabase
      .from("draws")
      .select("*")
      .in("status", ["published", "completed"])
      .order("draw_date", { ascending: false })
      .limit(10),
    supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("score_date", { ascending: false })
      .limit(5),
  ]);

  const draws = (drawsResult.data ?? []) as Draw[];
  const latestScores = ((scoresResult.data ?? []) as Score[])
    .map((s) => s.score)
    .filter((n): n is number => typeof n === "number");

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-ink-500">Draw</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink-900 sm:text-3xl">
          Monthly draw
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">
          Your latest 5 Stableford scores are your entry numbers. Match 5, 4 or
          3 of the drawn numbers to win — prize pools split 40/35/25, and an
          unclaimed jackpot rolls over.
        </p>
      </header>

      <section className="rounded-lg border border-ink-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-ink-900">Your entry numbers</h2>
        {latestScores.length === 0 ? (
          <p className="mt-2 text-sm text-ink-500">
            Add at least one score to enter the draw.{" "}
            <a href="/scores" className="font-medium text-brand-700 hover:text-brand-800">
              Add a score
            </a>
          </p>
        ) : (
          <div className="mt-3">
            <DrawNumbers numbers={latestScores} />
          </div>
        )}
      </section>

      {draws.length === 0 ? (
        <section className="rounded-lg border border-ink-200 bg-white">
          <EmptyState
            icon={Ticket}
            title="No published draws yet"
            message="Draw results appear here once the team publishes the monthly draw."
          />
        </section>
      ) : (
        <ul className="space-y-4" role="list">
          {draws.map((draw) => (
            <li key={draw.id} className="rounded-lg border border-ink-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-ink-900">
                    Draw — {formatDate(draw.draw_date)}
                  </h2>
                  <p className="text-sm text-ink-500">
                    {draw.draw_type === "special" ? "Special draw" : "Monthly draw"}
                  </p>
                </div>
                <StatusBadge status={draw.status} />
              </div>

              <div className="mt-4">
                {draw.status === "published" || draw.status === "completed" ? (
                  <DrawNumbers
                    numbers={[draw.number_1, draw.number_2, draw.number_3, draw.number_4, draw.number_5]}
                    size="lg"
                  />
                ) : (
                  <p className="text-sm text-ink-500">Numbers not drawn yet.</p>
                )}
              </div>

              <dl className="mt-4 divide-y divide-ink-100 border-t border-ink-100">
                <InfoRow label="Prize pool">
                  {formatCurrency(draw.total_prize_pool)}
                </InfoRow>
                <InfoRow label="Jackpot">
                  {formatCurrency(draw.jackpot_amount)}
                </InfoRow>
              </dl>

              <p className="mt-3 text-xs text-ink-500">
                {MATCH_TIER_LABELS.five}: {Math.round(PRIZE_SPLIT.five * 100)}% ·{" "}
                {MATCH_TIER_LABELS.four}: {Math.round(PRIZE_SPLIT.four * 100)}% ·{" "}
                {MATCH_TIER_LABELS.three}: {Math.round(PRIZE_SPLIT.three * 100)}% of the pool
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
