import type { Metadata } from "next";
import { CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate, titleCase } from "@/lib/format";
import type { Subscription } from "@/lib/database.types";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Admin · Subscriptions" };

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient();

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const subscriptions = (subs ?? []) as Subscription[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900">Subscriptions</h1>
        <p className="mt-1 text-sm text-ink-500">
          Plans, statuses and billing periods. Statuses are managed by trusted
          server/webhook logic only.
        </p>
      </header>

      <section className="rounded-lg border border-ink-200 bg-white">
        {subscriptions.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No subscriptions yet"
            message="Subscriptions appear here once users choose a plan."
            className="py-8"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Period start</th>
                  <th className="px-5 py-3 font-medium">Period end</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {subscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-5 py-3 font-mono text-xs text-ink-600">
                      {sub.user_id.slice(0, 8)}…
                    </td>
                    <td className="px-5 py-3 font-medium text-ink-900">
                      {titleCase(sub.plan)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-5 py-3 text-ink-600">
                      {formatDate(sub.current_period_start)}
                    </td>
                    <td className="px-5 py-3 text-ink-600">
                      {formatDate(sub.current_period_end)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
