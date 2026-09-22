import type { Metadata } from "next";
import {
  Plus,
  Ticket,
  Trophy,
  Heart,
  CreditCard,
  Medal,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { displayName, requireUser } from "@/lib/auth";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import {
  CharityTile,
  DrawTile,
  ScoresPanel,
  SubscriptionTile,
  WinningsPanel,
} from "@/components/dashboard/tiles";
import type {
  Charity,
  Draw,
  Score,
  Subscription,
  Winner,
} from "@/lib/database.types";

export const metadata: Metadata = { title: "Dashboard" };

/** Returns null on error — the UI renders an error/empty state instead of crashing. */
async function safeQuery<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.error("[dashboard] query failed:", error);
    return null;
  }
}

const quickActions = [
  { href: "/scores", label: "Add Score", icon: Plus },
  { href: "/scores", label: "View Scores", icon: Trophy },
  { href: "/charity", label: "Choose Charity", icon: Heart },
  { href: "/subscription", label: "Subscription", icon: CreditCard },
  { href: "/draw", label: "View Draw", icon: Ticket },
  { href: "/winnings", label: "View Winnings", icon: Medal },
];

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [profile, subscription, scores] = await Promise.all([
    safeQuery(async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    }),
    safeQuery(async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    }),
    safeQuery(async () => {
      const { data, error } = await supabase
        .from("scores")
        .select("*")
        .eq("user_id", user.id)
        .order("score_date", { ascending: false })
        .limit(5);

      if (error) throw error;
      return (data ?? []) as Score[];
    }),
  ]);

  const [selectedCharity, currentDraw, myWinners] = await Promise.all([
    safeQuery<Charity | null>(async () => {
      const charityId = profile?.charity_id;
      if (!charityId) return null;
      const { data } = await supabase
        .from("charities")
        .select("*")
        .eq("id", charityId)
        .maybeSingle();
      return data;
    }),
    safeQuery<Draw | null>(async () => {
      const { data } = await supabase
        .from("draws")
        .select("*")
        .in("status", ["published", "completed"])
        .order("draw_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    }),
    safeQuery<Winner[]>(async () => {
      const { data } = await supabase
        .from("winners")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return (data ?? []) as Winner[];
    }),
  ]);

  const name = displayName(user, profile);
  const latestScores = (scores ?? []) as Score[];
  const scoreValues = latestScores
    .map((s) => s.score)
    .filter((n): n is number => typeof n === "number");
  const averageScore =
    scoreValues.length > 0
      ? Math.round(
          scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
        )
      : null;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-ink-500">Dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink-900 sm:text-3xl">
          Welcome back, {name.split(" ")[0]}
        </h1>
      </header>

      {!profile ? (
        <Alert variant="error" title="Could not load your profile">
          <p>
            Please refresh the page. If this keeps happening, log out and back
            in.
          </p>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SubscriptionTile subscription={subscription as Subscription | null} />
        <CharityTile charity={selectedCharity} percentage={profile?.charity_percentage ?? null} />
        <DrawTile draw={currentDraw} />
      </div>

      <nav aria-label="Quick actions" className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {quickActions.map(({ href, label, icon: Icon }) => (
          <ButtonLink
            key={label}
            href={href}
            variant="secondary"
            size="sm"
            className="justify-start"
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </ButtonLink>
        ))}
      </nav>

      <ScoresPanel scores={latestScores} averageScore={averageScore} />
      <WinningsPanel winners={(myWinners ?? []) as Winner[]} />
    </div>
  );
}
