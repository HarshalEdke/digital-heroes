import Stripe from "stripe";
import { PLANS, type PlanId } from "@/lib/constants";

/**
 * Lazy Stripe client. The integration activates only when STRIPE_SECRET_KEY
 * is configured; otherwise subscription server actions fall back to recording
 * the subscription locally so the product stays usable in development.
 * The secret key is only ever read server-side — never exposed to the browser.
 */

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function stripePriceId(plan: PlanId): string | null {
  const value =
    plan === "monthly"
      ? process.env.STRIPE_PRICE_MONTHLY
      : process.env.STRIPE_PRICE_YEARLY;
  return value ?? null;
}

export function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  );
}

export function planPriceInr(plan: PlanId): number {
  return PLANS[plan].priceInr;
}
