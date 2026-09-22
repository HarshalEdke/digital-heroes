import type { Metadata } from "next";
import { CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { Subscription } from "@/lib/database.types";
import { PLANS } from "@/lib/constants";
import { isStripeConfigured } from "@/lib/stripe";
import { formatDate, titleCase } from "@/lib/format";
import { StatusBadge, InfoRow } from "@/components/ui/status-badge";
import { PlanActions } from "@/components/subscription/plan-actions";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Subscription" };

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const user = await requireUser();
  const { checkout } = await searchParams;
  const supabase = await createClient();

  const { data: subData } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const subscription = (subData ?? null) as Subscription | null;
  const status = subscription?.status ?? "inactive";
  const isActive = status === "active";
  const plan = subscription?.plan;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-ink-500">Subscription</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink-900 sm:text-3xl">
          Your subscription
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Your subscription fuels the prize pool and your chosen charity.
        </p>
      </header>

      {checkout === "success" ? (
        <Alert variant="success" title="Payment received">
          <p>
            Your subscription will activate as soon as our billing system
            confirms it — this usually takes a few seconds.
          </p>
        </Alert>
      ) : null}
      {checkout === "cancelled" ? (
        <Alert variant="info" title="Checkout cancelled">
          <p>No charge was made. You can subscribe whenever you&apos;re ready.</p>
        </Alert>
      ) : null}

      <section className="rounded-lg border border-ink-200 bg-white p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink-900">Current plan</h2>
          <StatusBadge status={status} />
        </div>
        {subscription && plan ? (
          <dl className="mt-3 divide-y divide-ink-100">
            <InfoRow label="Plan">{titleCase(plan)}</InfoRow>
            <InfoRow label="Status">{titleCase(status)}</InfoRow>
            <InfoRow label="Billing period starts">
              {formatDate(subscription.current_period_start)}
            </InfoRow>
            <InfoRow label={isActive ? "Renews" : "Ends"}>
              {formatDate(subscription.current_period_end)}
            </InfoRow>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-ink-500">No plan yet — choose one below.</p>
        )}
      </section>

      {!isStripeConfigured() ? (
        <Alert variant="info" title="Development billing">
          <p>
            Stripe is not configured on this environment, so subscriptions are
            recorded locally by the server. Add STRIPE_SECRET_KEY and price IDs
            to enable real Stripe Checkout.
          </p>
        </Alert>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        {(["monthly", "yearly"] as const).map((planId) => {
          const planDef = PLANS[planId];
          const isCurrent = isActive && plan === planId;
          return (
            <section
              key={planId}
              className="rounded-lg border border-ink-200 bg-white p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-ink-900">
                  {planDef.label}
                </h2>
                {isCurrent ? <StatusBadge status="active" /> : null}
              </div>
              <p className="mt-3 text-2xl font-semibold text-ink-900">
                ₹{planDef.priceInr.toLocaleString("en-IN")}
                <span className="text-sm font-normal text-ink-500">
                  {planId === "monthly" ? " /month" : " /year"}
                </span>
              </p>
              <p className="mt-1 text-sm text-ink-500">{planDef.description}</p>
              <div className="mt-4">
                <PlanActions plan={planId} hasActive={isActive} />
              </div>
            </section>
          );
        })}
      </section>

      <p className="flex items-center gap-2 text-xs text-ink-500">
        <CreditCard className="size-4" aria-hidden />
        Subscription status is managed server-side and never set by the browser.
      </p>
    </div>
  );
}
