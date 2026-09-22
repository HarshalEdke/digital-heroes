import type { Metadata } from "next";
import Link from "next/link";
import {
  CreditCard,
  Eye,
  Medal,
  Ticket,
  Trophy,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, titleCase } from "@/lib/format";
import { StatusBadge, InfoRow } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DrawNumbers } from "@/components/draw/draw-numbers";
import type { Draw, Winner } from "@/lib/database.types";

export const metadata: Metadata = { title: "Admin" };

type TableName =
  | "profiles"
  | "charities"
  | "subscriptions"
  | "scores"
  | "draws"
  | "draw_entries"
  | "winners"
  | "payments";

async function count(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: TableName,
  filters: Record<string, string> = {}
): Promise<number | null> {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value);
  }
  const { count: total, error } = await query;
  if (error) return null;
  return total ?? 0;
}

export default async function AdminPage() {
  const supabase = await createClient();

  const [totalUsers, activeSubs, totalScores, pendingProofs, pendingPayouts] =
    await Promise.all([
      count(supabase, "profiles"),
      count(supabase, "subscriptions", { status: "active" }),
      count(supabase, "scores"),
      count(supabase, "winners", { verification_status: "pending" }),
      count(supabase, "winners", { payout_status: "pending" }),
    ]);

  const { data: currentDraw } = await supabase
    .from("draws")
    .select("*")
    .order("draw_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: recentWinners } = await supabase
    .from("winners")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const draw = (currentDraw ?? null) as Draw | null;
  const winners = (recentWinners ?? []) as Winner[];

  const stats = [
    { label: "Total users", value: totalUsers, icon: Users, href: "/admin/users" },
    { label: "Active subscriptions", value: activeSubs, icon: CreditCard, href: "/admin/subscriptions" },
    { label: "Total scores", value: totalScores, icon: Trophy, href: "/admin/scores" },
    { label: "Pending proof reviews", value: pendingProofs, icon: Eye, href: "/admin/winners" },
    { label: "Pending payouts", value: pendingPayouts, icon: Medal, href: "/admin/winners" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-ink-500">Admin</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink-900 sm:text-3xl">
          Overview
        </h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-lg border border-ink-200 bg-white p-5 transition-colors hover:border-brand-300"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-ink-500">{label}</h2>
              <Icon className="size-4 text-ink-400" aria-hidden />
            </div>
            <p className="mt-2 text-2xl font-semibold text-ink-900">
              {value === null ? "—" : value.toLocaleString("en-IN")}
            </p>
          </Link>
        ))}
      </div>

      <section className="rounded-lg border border-ink-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink-900">Current draw</h2>
          <Link
            href="/admin/draws"
            className="text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            Manage draws
          </Link>
        </div>
        {draw ? (
          <>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-base font-semibold text-ink-900">
                Draw — {formatDate(draw.draw_date)}
              </p>
              <StatusBadge status={draw.status} />
            </div>
            {draw.status !== "draft" ? (
              <div className="mt-3">
                <DrawNumbers
                  numbers={[draw.number_1, draw.number_2, draw.number_3, draw.number_4, draw.number_5]}
                />
              </div>
            ) : null}
            <dl className="mt-3 divide-y divide-ink-100 border-t border-ink-100">
              <InfoRow label="Prize pool">{formatCurrency(draw.total_prize_pool)}</InfoRow>
              <InfoRow label="Jackpot">{formatCurrency(draw.jackpot_amount)}</InfoRow>
            </dl>
          </>
        ) : (
          <EmptyState
            icon={Ticket}
            title="No draws yet"
            message="Create the first draw from the Draws page."
            className="py-6"
          />
        )}
      </section>

      <section className="rounded-lg border border-ink-200 bg-white p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink-900">Recent winners</h2>
          <Link
            href="/admin/winners"
            className="text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            Manage winners
          </Link>
        </div>
        {winners.length === 0 ? (
          <p className="mt-2 text-sm text-ink-500">No winners recorded yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-100" role="list">
            {winners.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span className="font-mono text-xs text-ink-500">
                  {row.user_id.slice(0, 8)}…
                </span>
                <span className="text-sm text-ink-900">{titleCase(row.match_type)}</span>
                <span className="text-sm font-medium text-ink-900">
                  {formatCurrency(row.prize_amount)}
                </span>
                <span className="flex gap-2">
                  <StatusBadge status={row.verification_status ?? "pending"} />
                  <StatusBadge status={row.payout_status ?? "pending"} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}