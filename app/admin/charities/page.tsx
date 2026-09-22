import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Charity } from "@/lib/database.types";
import { CharityAdminForm } from "@/components/admin/charity-admin-form";
import { CharityImage } from "@/components/charity/charity-image";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";

export const metadata: Metadata = { title: "Admin · Charities" };

export default async function AdminCharitiesPage() {
  const supabase = await createClient();

  const { data: charities } = await supabase
    .from("charities")
    .select("*")
    .order("name", { ascending: true });

  const list = (charities ?? []) as Charity[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900">Charities</h1>
        <p className="mt-1 text-sm text-ink-500">
          Create, edit, feature and activate the charities users can choose.
        </p>
      </header>

      <section className="rounded-lg border border-ink-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-ink-900">New charity</h2>
        <div className="mt-4">
          <CharityAdminForm />
        </div>
      </section>

      {list.length === 0 ? (
        <section className="rounded-lg border border-ink-200 bg-white">
          <EmptyState icon={Heart} title="No charities yet" className="py-8" />
        </section>
      ) : (
        <ul className="space-y-4" role="list">
          {list.map((charity) => (
            <li key={charity.id} className="rounded-lg border border-ink-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <CharityImage
                    src={charity.image_url}
                    alt={charity.name}
                    className="size-12 shrink-0 rounded-md"
                    iconClassName="size-5"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-ink-900">
                        {charity.name}
                      </h2>
                      <StatusBadge status={charity.is_active ? "active" : "inactive"} />
                      {charity.is_featured ? <StatusBadge status="featured" /> : null}
                    </div>
                    <p className="mt-0.5 max-w-xl text-sm text-ink-500">
                      {charity.description ?? "No description"}
                    </p>
                  </div>
                </div>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium text-brand-700 hover:text-brand-800">
                  Edit charity
                </summary>
                <div className="mt-4">
                  <CharityAdminForm charity={charity} />
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
