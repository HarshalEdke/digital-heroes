import type { Metadata } from "next";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate, titleCase } from "@/lib/format";
import type { Profile } from "@/lib/database.types";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Admin · Users" };

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const users = (profiles ?? []) as Profile[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900">Users</h1>
        <p className="mt-1 text-sm text-ink-500">
          Registered profiles, roles and selected charities.
        </p>
      </header>

      <section className="rounded-lg border border-ink-200 bg-white">
        {users.length === 0 ? (
          <EmptyState icon={Users} title="No users yet" className="py-8" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Charity</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-5 py-3 font-medium text-ink-900">
                      {user.full_name || "—"}
                    </td>
                    <td className="px-5 py-3 text-ink-600">{user.email ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-700">
                        {titleCase(user.role ?? "user")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink-600">
                      {user.charity_id ? `${user.charity_id.slice(0, 8)}… · ${user.charity_percentage ?? "—"}%` : "—"}
                    </td>
                    <td className="px-5 py-3 text-ink-600">{formatDate(user.created_at)}</td>
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
