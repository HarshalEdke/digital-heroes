"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PLANS, type PlanId } from "@/lib/constants";
import { isPlanId } from "@/lib/constants";
import { appUrl, getStripe, planPriceInr, stripePriceId } from "@/lib/stripe";
import {
  actionError,
  actionSuccess,
  safeDbError,
  type ActionResult,
} from "@/lib/actions/types";

const SUB_PATHS = ["/dashboard", "/subscription"];

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

async function activeSubscription(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  return supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
}

/**
 * Starts a subscription for the signed-in user.
 *
 * - When Stripe is configured (STRIPE_SECRET_KEY + price IDs), creates a real
 *   Checkout Session and returns its URL. The subscription row is only written
 *   by the webhook (trusted server-side source).
 * - Without Stripe keys, records the subscription and payment locally from the
 *   server action so the product is fully usable in development. The status is
 *   still written server-side — never from the browser.
 */
export async function startSubscription(planInput: unknown): Promise<ActionResult<{ redirectUrl?: string }>> {
  const user = await requireUser();
  if (!isPlanId(planInput)) {
    return actionError("Choose a plan first.");
  }
  const plan: PlanId = planInput;
  const price = planPriceInr(plan);

  const stripe = getStripe();
  const priceId = stripePriceId(plan);

  if (stripe && priceId) {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl()}/subscription?checkout=success`,
        cancel_url: `${appUrl()}/subscription?checkout=cancelled`,
        client_reference_id: user.id,
        metadata: { user_id: user.id, plan },
        subscription_data: { metadata: { user_id: user.id, plan } },
      });
      if (session.url) {
        return actionSuccess("Redirecting to checkout…", { redirectUrl: session.url });
      }
      return actionError("Checkout could not be started. Please try again.");
    } catch (error) {
      console.error("[subscription] stripe checkout failed:", error);
      return actionError("Payment provider is unavailable right now. Please try again.");
    }
  }

  // Development fallback: activate the subscription server-side.
  const supabase = await createClient();
  const now = new Date();
  const periodEnd = addMonths(now, PLANS[plan].months);
  const current = await activeSubscription(supabase, user.id);

  const payload = {
    plan,
    status: "active",
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
    updated_at: now.toISOString(),
  };

  let error: { code?: string; message?: string } | null = null;
  if (current?.data) {
    const res = await supabase
      .from("subscriptions")
      .update(payload)
      .eq("id", (current.data as { id: string }).id)
      .eq("user_id", user.id);
    error = res.error;
  } else {
    const res = await supabase.from("subscriptions").insert({
      user_id: user.id,
      ...payload,
    });
    error = res.error;
  }

  if (error) {
    return actionError(
      safeDbError(error, "Could not activate your subscription. Please try again.")
    );
  }

  await supabase.from("payments").insert({
    user_id: user.id,
    subscription_id: current?.data
      ? (current.data as { id: string }).id
      : null,
    payment_type: "subscription",
    amount: price,
    currency: "INR",
    status: "succeeded",
  });

  for (const path of SUB_PATHS) revalidatePath(path);
  return actionSuccess(
    `${PLANS[plan].label} subscription activated. (Stripe is not configured — using local billing.)`
  );
}

/** Cancels the signed-in user's active subscription (server-side status update). */
export async function cancelSubscription(): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: current, error: fetchError } = await activeSubscription(supabase, user.id);
  if (fetchError || !current) {
    return actionError("No subscription found to cancel.");
  }

  const { id, stripe_subscription_id } = current as {
    id: string;
    stripe_subscription_id: string | null;
  };

  // With Stripe configured, cancel at the provider; the webhook confirms.
  const stripe = getStripe();
  if (stripe && stripe_subscription_id) {
    try {
      await stripe.subscriptions.update(stripe_subscription_id, {
        cancel_at_period_end: true,
      });
    } catch (error) {
      console.error("[subscription] stripe cancel failed:", error);
      return actionError("Could not cancel with the payment provider. Please try again.");
    }
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return actionError(safeDbError(error, "Could not cancel your subscription. Please try again."));
  }

  for (const path of SUB_PATHS) revalidatePath(path);
  return actionSuccess("Your subscription has been cancelled.");
}
