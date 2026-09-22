import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Stripe webhook — the only trusted source for subscription status updates.
 * Configure with: stripe listen --forward-to <app>/api/stripe/webhook
 * Required env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.
 *
 * Uses the service-role key when provided (SUPABASE_SERVICE_ROLE_KEY) because
 * webhooks arrive without a user session; the key never reaches the browser.
 */
async function supabaseForWebhook() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  const { createClient } = await import("@supabase/supabase-js");
  return createClient(url, serviceKey);
}

type WebhookSupabase = NonNullable<Awaited<ReturnType<typeof supabaseForWebhook>>>;

function periodFrom(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0];
  return {
    current_period_start: item?.current_period_start
      ? new Date(item.current_period_start * 1000).toISOString()
      : null,
    current_period_end: item?.current_period_end
      ? new Date(item.current_period_end * 1000).toISOString()
      : null,
  };
}

function statusFrom(subscription: Stripe.Subscription): string {
  switch (subscription.status) {
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "cancelled";
    case "incomplete":
      return "inactive";
    default:
      return "inactive";
  }
}

/**
 * Upserts a subscription row keyed by the Stripe subscription id (works with
 * or without a DB unique constraint on stripe_subscription_id).
 */
async function upsertSubscription(
  supabase: WebhookSupabase,
  row: Record<string, unknown> & { stripe_subscription_id: string }
) {
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", row.stripe_subscription_id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("subscriptions")
      .update(row)
      .eq("id", (existing as { id: string }).id);
  } else {
    await supabase.from("subscriptions").insert(row);
  }
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secret) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const payload = await request.text();
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("[stripe-webhook] signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const supabase = await supabaseForWebhook();
  if (!supabase) {
    console.error(
      "[stripe-webhook] SUPABASE_SERVICE_ROLE_KEY is not set; cannot persist subscription updates."
    );
    return NextResponse.json({ error: "Server not configured." }, { status: 503 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id ?? session.metadata?.user_id;
        const plan = session.metadata?.plan ?? "monthly";
        if (
          session.subscription &&
          typeof session.subscription === "string" &&
          userId
        ) {
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          const period = periodFrom(sub);
          await upsertSubscription(supabase, {
            user_id: userId,
            plan,
            status: statusFrom(sub),
            stripe_customer_id:
              typeof session.customer === "string" ? session.customer : null,
            stripe_subscription_id: sub.id,
            ...period,
            updated_at: new Date().toISOString(),
          });
          await supabase.from("payments").insert({
            user_id: userId,
            payment_type: "subscription",
            amount: session.amount_total ?? null,
            currency: session.currency ?? "inr",
            status: "succeeded",
            stripe_payment_id:
              typeof session.payment_intent === "string" ? session.payment_intent : null,
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const period = periodFrom(subscription);
        await supabase
          .from("subscriptions")
          .update({
            status: statusFrom(subscription),
            ...period,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      default:
        // Unhandled event types are acknowledged.
        break;
    }
  } catch (error) {
    console.error("[stripe-webhook] handler failed:", error);
    return NextResponse.json({ error: "Handler error." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
