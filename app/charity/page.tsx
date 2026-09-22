import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { Charity, Profile } from "@/lib/database.types";
import { MIN_CHARITY_PERCENTAGE } from "@/lib/constants";
import { CharityPicker } from "@/components/charity/charity-picker";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = { title: "My Charity" };

export default async function CharityPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [profileResult, charitiesResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("charities")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("name", { ascending: true }),
  ]);

  const profile = (profileResult.data ?? null) as Profile | null;
  const charities = (charitiesResult.data ?? []) as Charity[];

  const selected = charities.find((c) => c.id === profile?.charity_id) ?? null;
  const percentage = profile?.charity_percentage ?? MIN_CHARITY_PERCENTAGE;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-ink-500">Charity</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink-900 sm:text-3xl">
          My charity
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">
          Choose the cause your subscription supports. Every subscription
          contributes at least {MIN_CHARITY_PERCENTAGE}% — you decide how much
          more.
        </p>
      </header>

      {profileResult.error || charitiesResult.error ? (
        <Alert variant="error" title="Could not load this page">
          <p>Please refresh and try again in a moment.</p>
        </Alert>
      ) : null}

      {selected ? (
        <section className="rounded-lg border border-ink-200 bg-white p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink-900">Current selection</h2>
            <span className="text-sm font-medium text-brand-700">{percentage}%</span>
          </div>
          <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-ink-900">
            <Heart className="size-4 text-brand-600" aria-hidden />
            {selected.name}
          </p>
        </section>
      ) : null}

      <section className="rounded-lg border border-ink-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-ink-900">Choose a charity</h2>
        {charities.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No charities available yet"
            message="Check back soon — charities are added by the Digital Heroes team."
          />
        ) : (
          <div className="mt-4">
            <CharityPicker
              charities={charities}
              selectedCharityId={profile?.charity_id ?? null}
              currentPercentage={percentage}
            />
          </div>
        )}
      </section>
    </div>
  );
}
