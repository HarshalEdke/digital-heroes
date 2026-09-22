import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import type { Score } from "@/lib/database.types";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Admin · Scores" };

export default async function AdminScoresPage() {
  const supabase = await createClient();

  const { data: scores } = await supabase
    .from("scores")
    .select("*")
    .order("score_date", { ascending: false })
    .limit(200);

  const list = (scores ?? []) as Score[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900">Scores</h1>
        <p className="mt-1 text-sm text-ink-500">
          Latest submitted Stableford scores across all users.
        </p>
      </header>

      <section className="rounded-lg border border-ink-200 bg-white">
        {list.length === 0 ? (
          <EmptyState icon={Trophy} title="No scores submitted yet" className="py-8" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {list.map((score) => (
                  <tr key={score.id}>
                    <td className="px-5 py-3 font-mono text-xs text-ink-600">
                      {score.user_id.slice(0, 8)}…
                    </td>
                    <td className="px-5 py-3 font-medium text-ink-900">
                      {score.score ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-ink-600">
                      {formatDate(score.score_date)}
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
