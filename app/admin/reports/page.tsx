import type { Metadata } from "next";
import { FileBarChart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Charity, Draw, Payment, Profile } from "@/lib/database.types";
import { formatCurrency } from "@/lib/format";
import { InfoRow } from "@/components/ui/status-badge";

export const metadata: Metadata = { title: "Admin · Reports" };

export default async function AdminReportsPage() {
  const supabase = await createClient();

  const [profilesResult, subsResult, scoresResult, drawsResult, winnersResult, charitiesResult, paymentsResult] =
    await Promise.all([
      supabase.from("profiles").select("id, charity_id, charity_percentage"),
      supabase.from("subscriptions").select("plan, status"),
      supabase.from("scores").select("id, score"),
      supabase.from("draws").select("*"),
      supabase.from("winners").select("prize_amount, verification_status, payout_status"),
      supabase.from("charities").select("*"),
      supabase.from("payments").select("amount, currency, status"),
    ]);

  const profiles = (profilesResult.data ?? []) as Pick<Profile, "id" | "charity_id" | "charity_percentage">[];
  const subscriptions = (subsResult.data ?? []) as { plan: string | null; status: string | null }[];
  const scores = (scoresResult.data ?? []) as { id: string; score: number | null }[];
  const draws = (drawsResult.data ?? []) as Draw[];
  const winners = (winnersResult.data ?? []) as {
    prize_amount: number | null;
    verification_status: string | null;
    payout_status: string | null;
  }[];
  const charities = (charitiesResult.data ?? []) as Charity[];
  const payments = (paymentsResult.data ?? []) as Payment[];

  // Aggregates are computed server-side from DB rows.
  const activeSubs = subscriptions.filter((s) => s.status === "active");
  const scoredValues = scores.map((s) => s.score ?? 0);
  const avgScore =
    scoredValues.length > 0
      ? Math.round(scoredValues.reduce((a, b) => a + b, 0) / scoredValues.length)
      : null;

  const charityUsers = new Map<string, { users: number; percentageSum: number }>();
  for (const p of profiles) {
    if (!p.charity_id) continue;
    const entry = charityUsers.get(p.charity_id) ?? { users: 0, percentageSum: 0 };
    entry.users += 1;
    entry.percentageSum += p.charity_percentage ?? 0;
    charityUsers.set(p.charity_id, entry);
  }
  const charityName = (id: string) => charities.find((c) => c.id === id)?.name ?? "Unknown";

  const paidWinnings = winners
    .filter((w) => w.payout_status === "paid")
    .reduce((sum, w) => sum + (w.prize_amount ?? 0), 0);
  const pendingWinnings = winners
    .filter((w) => w.payout_status === "pending")
    .reduce((sum, w) => sum + (w.prize_amount ?? 0), 0);
  const totalPayments = payments
    .filter((p) => p.status === "succeeded")
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900">Reports</h1>
        <p className="mt-1 text-sm text-ink-500">
          Users, subscriptions, charity contributions, draws and winnings.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-ink-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-ink-900">Users & subscriptions</h2>
          <dl className="mt-3 divide-y divide-ink-100">
            <InfoRow label="Total users">{profiles.length.toLocaleString("en-IN")}</InfoRow>
            <InfoRow label="Active subscriptions">{activeSubs.length.toLocaleString("en-IN")}</InfoRow>
            <InfoRow label="Total subscriptions">{subscriptions.length.toLocaleString("en-IN")}</InfoRow>
            <InfoRow label="Succeeded payments">{formatCurrency(totalPayments)}</InfoRow>
          </dl>
        </section>

        <section className="rounded-lg border border-ink-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-ink-900">Scores</h2>
          <dl className="mt-3 divide-y divide-ink-100">
            <InfoRow label="Total scores">{scores.length.toLocaleString("en-IN")}</InfoRow>
            <InfoRow label="Average score">{avgScore ?? "—"}</InfoRow>
          </dl>
        </section>

        <section className="rounded-lg border border-ink-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-ink-900">Charity contributions</h2>
          {charityUsers.size === 0 ? (
            <p className="mt-2 text-sm text-ink-500">No charity selections yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-ink-100" role="list">
              {[...charityUsers.entries()].map(([id, stat]) => (
                <li key={id} className="flex items-baseline justify-between gap-4 py-2">
                  <span className="text-sm text-ink-800">{charityName(id)}</span>
                  <span className="text-sm text-ink-500">
                    {stat.users} user{stat.users === 1 ? "" : "s"} · avg{" "}
                    {Math.round(stat.percentageSum / stat.users)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-ink-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-ink-900">Draws & winnings</h2>
          <dl className="mt-3 divide-y divide-ink-100">
            <InfoRow label="Total draws">{draws.length.toLocaleString("en-IN")}</InfoRow>
            <InfoRow label="Published draws">
              {draws.filter((d) => d.status === "published" || d.status === "completed").length}
            </InfoRow>
            <InfoRow label="Winners recorded">{winners.length.toLocaleString("en-IN")}</InfoRow>
            <InfoRow label="Winnings paid">{formatCurrency(paidWinnings)}</InfoRow>
            <InfoRow label="Winnings pending payout">{formatCurrency(pendingWinnings)}</InfoRow>
          </dl>
        </section>
      </div>

      <p className="flex items-center gap-2 text-xs text-ink-400">
        <FileBarChart className="size-4" aria-hidden />
        Figures reflect current database rows at page load.
      </p>
    </div>
  );
}