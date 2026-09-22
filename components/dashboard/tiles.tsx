import Link from "next/link";
import { Heart, Ticket } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge, InfoRow } from "@/components/ui/status-badge";
import { formatCurrency, formatDate, titleCase } from "@/lib/format";
import type {
  Charity,
  Draw,
  Score,
  Subscription,
  Winner,
} from "@/lib/database.types";

export function SubscriptionTile({
  subscription,
}: {
  subscription: Subscription | null;
}) {
  const sub = subscription;
  const plan = sub?.plan
    ? sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)
    : null;

  return (
    <section className="rounded-lg border border-ink-200 bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink-900">Subscription</h2>
        <StatusBadge status={sub?.status ?? "inactive"} />
      </div>
      <p className="mt-3 text-lg font-semibold text-ink-900">
        {plan ?? "No plan yet"}
      </p>
      <dl className="mt-2 divide-y divide-ink-100">
        <InfoRow label="Renews">
          {sub?.current_period_end ? formatDate(sub.current_period_end) : "—"}
        </InfoRow>
      </dl>
      {!sub || sub.status !== "active" ? (
        <ButtonLink href="/subscription" size="sm" className="mt-3 w-full">
          Choose a plan
        </ButtonLink>
      ) : null}
    </section>
  );
}

export function CharityTile({
  charity,
  percentage,
}: {
  charity: Charity | null;
  percentage: number | null;
}) {
  return (
    <section className="rounded-lg border border-ink-200 bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink-900">My Charity</h2>
        <Heart className="size-4 text-brand-600" aria-hidden />
      </div>
      {charity ? (
        <>
          <p
            className="mt-3 truncate text-lg font-semibold text-ink-900"
            title={charity.name}
          >
            {charity.name}
          </p>
          <p className="mt-1 text-sm text-ink-500">
            Contribution:{" "}
            <span className="font-medium text-ink-800">
              {percentage ?? 10}% of subscription
            </span>
          </p>
          <Link
            href="/charity"
            className="mt-3 inline-block text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            Change charity
          </Link>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm text-ink-500">
            Select a charity to get started.
          </p>
          <ButtonLink
            href="/charity"
            variant="secondary"
            size="sm"
            className="mt-3 w-full"
          >
            Choose charity
          </ButtonLink>
        </>
      )}
    </section>
  );
}

export function DrawTile({ draw }: { draw: Draw | null }) {
  return (
    <section className="rounded-lg border border-ink-200 bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink-900">Current Draw</h2>
        <Ticket className="size-4 text-brand-600" aria-hidden />
      </div>
      {draw ? (
        <>
          <p className="mt-3 text-lg font-semibold text-ink-900">
            {formatDate(draw.draw_date)}
          </p>
          <dl className="mt-2 divide-y divide-ink-100">
            <InfoRow label="Prize pool">
              {formatCurrency(draw.total_prize_pool)}
            </InfoRow>
            <InfoRow label="Jackpot">{formatCurrency(draw.jackpot_amount)}</InfoRow>
          </dl>
          <StatusBadge status={draw.status} className="mt-2" />
        </>
      ) : (
        <p className="mt-3 text-sm text-ink-500">
          Subscribe and add scores to be entered automatically.
        </p>
      )}
      <ButtonLink
        href="/draw"
        variant="secondary"
        size="sm"
        className="mt-3 w-full"
      >
        View draws
      </ButtonLink>
    </section>
  );
}

export function ScoresPanel({
  scores,
  averageScore,
}: {
  scores: Score[];
  averageScore: number | null;
}) {
  return (
    <section className="rounded-lg border border-ink-200 bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-ink-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-ink-900">
          Latest scores
          {averageScore !== null ? (
            <span className="ml-2 font-normal text-ink-500">
              · average {averageScore}
            </span>
          ) : null}
        </h2>
        <Link
          href="/scores"
          className="text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Manage scores
        </Link>
      </div>
      {scores.length === 0 ? (
        <p className="px-5 py-6 text-sm text-ink-500">No scores added yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-5">
          {scores.map((score) => (
            <li
              key={score.id}
              className="rounded-md bg-ink-50 p-3 text-center"
            >
              <span className="block text-2xl font-semibold text-ink-900">
                {score.score ?? "—"}
              </span>
              <span className="mt-0.5 block text-xs text-ink-500">
                {formatDate(score.score_date)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function WinningsPanel({ winners }: { winners: Winner[] }) {
  return (
    <section className="rounded-lg border border-ink-200 bg-white px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink-900">Winnings</h2>
        <Link
          href="/winnings"
          className="text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          View winnings
        </Link>
      </div>
      {winners.length === 0 ? (
        <p className="mt-1 text-sm text-ink-500">No winnings yet.</p>
      ) : (
        <ul className="mt-2 divide-y divide-ink-100" role="list">
          {winners.map((winner) => (
            <li
              key={winner.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2"
            >
              <span className="text-sm text-ink-900">
                {titleCase(winner.match_type)}
              </span>
              <span className="text-sm font-medium text-ink-900">
                {formatCurrency(winner.prize_amount)}
              </span>
              <StatusBadge status={winner.payout_status ?? "pending"} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
