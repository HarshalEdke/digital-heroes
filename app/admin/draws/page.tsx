import type { Metadata } from "next";
import { Ticket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Draw } from "@/lib/database.types";
import { formatDate, formatCurrency } from "@/lib/format";
import { DrawCreateForm } from "@/components/admin/draw-create-form";
import { DrawActions } from "@/components/admin/draw-actions";
import { DrawNumbers } from "@/components/draw/draw-numbers";
import { StatusBadge, InfoRow } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Admin · Draws" };

export default async function AdminDrawsPage() {
  const supabase = await createClient();

  const { data: draws } = await supabase
    .from("draws")
    .select("*")
    .order("draw_date", { ascending: false })
    .limit(50);

  const list = (draws ?? []) as Draw[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900">Draws</h1>
        <p className="mt-1 text-sm text-ink-500">
          Create a draft, simulate to generate numbers and entries, then
          publish to award prizes. Prize splits: 40% (5 numbers), 35% (4), 25%
          (3); an unclaimed jackpot rolls over.
        </p>
      </header>

      <section className="rounded-lg border border-ink-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-ink-900">Create a draw</h2>
        <div className="mt-4">
          <DrawCreateForm />
        </div>
      </section>

      {list.length === 0 ? (
        <section className="rounded-lg border border-ink-200 bg-white">
          <EmptyState icon={Ticket} title="No draws yet" className="py-8" />
        </section>
      ) : (
        <ul className="space-y-4" role="list">
          {list.map((draw) => (
            <li key={draw.id} className="rounded-lg border border-ink-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-ink-900">
                    Draw — {formatDate(draw.draw_date)}
                  </h2>
                  <p className="text-sm text-ink-500">
                    {draw.draw_type === "special" ? "Special draw" : "Monthly draw"}
                    {draw.published_at ? ` · Published ${formatDate(draw.published_at)}` : ""}
                  </p>
                </div>
                <StatusBadge status={draw.status} />
              </div>

              {draw.status !== "draft" ? (
                <div className="mt-3">
                  <DrawNumbers
                    numbers={[draw.number_1, draw.number_2, draw.number_3, draw.number_4, draw.number_5]}
                  />
                </div>
              ) : (
                <p className="mt-3 text-sm text-ink-500">Numbers are generated on simulation.</p>
              )}

              <dl className="mt-3 divide-y divide-ink-100 border-t border-ink-100">
                <InfoRow label="Prize pool">{formatCurrency(draw.total_prize_pool)}</InfoRow>
                <InfoRow label="Jackpot">{formatCurrency(draw.jackpot_amount)}</InfoRow>
              </dl>

              <div className="mt-3">
                <DrawActions draw={draw} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
