import type { Metadata } from "next";
import { Medal } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Draw, Winner } from "@/lib/database.types";
import { MATCH_TIER_LABELS, type MatchTier } from "@/lib/constants";
import { formatCurrency, formatDate, titleCase } from "@/lib/format";
import { WinnerActions } from "@/components/admin/winner-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Admin · Winners" };

export default async function AdminWinnersPage() {
  const supabase = await createClient();

  const [winnersResult, drawsResult] = await Promise.all([
    supabase
      .from("winners")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("draws").select("id, draw_date, status"),
  ]);

  const winners = (winnersResult.data ?? []) as Winner[];
  const draws = (drawsResult.data ?? []) as Pick<Draw, "id" | "draw_date" | "status">[];
  const drawById = new Map(draws.map((d) => [d.id, d]));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900">Winners</h1>
        <p className="mt-1 text-sm text-ink-500">
          Review submitted proofs, approve or reject verification, and record
          payouts.
        </p>
      </header>

      {winners.length === 0 ? (
        <section className="rounded-lg border border-ink-200 bg-white">
          <EmptyState
            icon={Medal}
            title="No winners yet"
            message="Winners are created automatically when a draw is published."
            className="py-8"
          />
        </section>
      ) : (
        <ul className="space-y-4" role="list">
          {winners.map((winner) => {
            const draw = drawById.get(winner.draw_id);
            const tier = (winner.match_type ?? "") as MatchTier;
            const tierLabel = MATCH_TIER_LABELS[tier] ?? titleCase(winner.match_type);
            return (
              <li key={winner.id} className="rounded-lg border border-ink-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-ink-900">
                      {tierLabel}
                      {draw?.draw_date ? (
                        <span className="font-normal text-ink-500">
                          {" "}
                          · Draw {formatDate(draw.draw_date)}
                        </span>
                      ) : null}
                    </h2>
                    <p className="mt-0.5 text-sm text-ink-500">
                      User <span className="font-mono text-xs">{winner.user_id.slice(0, 8)}…</span>{" "}
                      · {formatCurrency(winner.prize_amount)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={winner.verification_status ?? "pending"} />
                    <StatusBadge status={winner.payout_status ?? "pending"} />
                  </div>
                </div>

                <div className="mt-3 border-t border-ink-100 pt-3 text-sm">
                  <p className="text-ink-500">Proof</p>
                  {winner.proof_url ? (
                    <a
                      href={winner.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all font-medium text-brand-700 hover:text-brand-800"
                    >
                      {winner.proof_url}
                    </a>
                  ) : (
                    <p className="text-ink-500">Not submitted yet.</p>
                  )}
                </div>

                <div className="mt-3">
                  <WinnerActions
                    winnerId={winner.id}
                    verificationStatus={winner.verification_status}
                    payoutStatus={winner.payout_status}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
