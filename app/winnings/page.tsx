import type { Metadata } from "next";
import { Medal } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { Draw, Winner } from "@/lib/database.types";
import { MATCH_TIER_LABELS, type MatchTier } from "@/lib/constants";
import { formatDate, formatCurrency, titleCase } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ProofForm } from "@/components/winnings/proof-form";

export const metadata: Metadata = { title: "Winnings" };

export default async function WinningsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [winnersResult, drawsResult] = await Promise.all([
    supabase
      .from("winners")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("draws").select("id, draw_date, status"),
  ]);

  const winners = (winnersResult.data ?? []) as Winner[];
  const draws = (drawsResult.data ?? []) as Pick<Draw, "id" | "draw_date" | "status">[];
  const drawById = new Map(draws.map((d) => [d.id, d]));

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-ink-500">Winnings</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink-900 sm:text-3xl">
          Your winnings
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Submit a proof of your result for verification, then the team pays
          out approved prizes.
        </p>
      </header>

      {winners.length === 0 ? (
        <section className="rounded-lg border border-ink-200 bg-white">
          <EmptyState
            icon={Medal}
            title="No winnings yet"
            message="Match 3, 4 or 5 numbers in a published draw to appear here."
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
                    <p className="mt-1 text-xl font-semibold text-ink-900">
                      {formatCurrency(winner.prize_amount)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={winner.verification_status ?? "pending"} />
                    <StatusBadge status={winner.payout_status ?? "pending"} />
                  </div>
                </div>

                <dl className="mt-4 grid gap-x-6 gap-y-1 border-t border-ink-100 pt-3 text-sm sm:grid-cols-2">
                  <div className="flex justify-between gap-4 sm:block">
                    <dt className="text-ink-500">Proof</dt>
                    <dd className="text-ink-900 sm:text-right">
                      {winner.proof_url ? (
                        <a
                          href={winner.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-brand-700 hover:text-brand-800"
                        >
                          View submitted proof
                        </a>
                      ) : (
                        "Not submitted"
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:block">
                    <dt className="text-ink-500">Verified</dt>
                    <dd className="text-ink-900 sm:text-right">
                      {winner.verified_at ? formatDate(winner.verified_at) : "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:block">
                    <dt className="text-ink-500">Payout</dt>
                    <dd className="text-ink-900 sm:text-right">
                      {titleCase(winner.payout_status ?? "pending")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:block">
                    <dt className="text-ink-500">Paid date</dt>
                    <dd className="text-ink-900 sm:text-right">
                      {winner.paid_at ? formatDate(winner.paid_at) : "—"}
                    </dd>
                  </div>
                </dl>

                {winner.payout_status !== "paid" &&
                winner.verification_status !== "approved" ? (
                  <div className="mt-4 border-t border-ink-100 pt-4">
                    <ProofForm winnerId={winner.id} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
