import type { Metadata } from "next";
import {
  CreditCard,
  KeyRound,
  Mail,
  ShieldCheck,
  TriangleAlert,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { Profile, Subscription } from "@/lib/database.types";
import { formatDate, titleCase } from "@/lib/format";
import { Alert } from "@/components/ui/alert";
import { StatusBadge, InfoRow } from "@/components/ui/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { ProfileForm } from "@/components/settings/profile-form";
import { EmailForm } from "@/components/settings/email-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [profileResult, subscriptionResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const profile = (profileResult.data ?? null) as Profile | null;
  const subscription = (subscriptionResult.data ?? null) as Subscription | null;
  const email = user.email ?? profile?.email ?? "";
  const emailConfirmed = user.email_confirmed_at != null;
  const isActive = subscription?.status === "active";

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-ink-500">Settings</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink-900 sm:text-3xl">
          Account settings
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Manage your account details, email address and password.
        </p>
      </header>

      {profileResult.error || subscriptionResult.error ? (
        <Alert variant="error" title="Could not load this page">
          <p>Please refresh and try again in a moment.</p>
        </Alert>
      ) : null}

      <section
        aria-labelledby="account-heading"
        className="rounded-lg border border-ink-200 bg-white p-5"
      >
        <h2
          id="account-heading"
          className="flex items-center gap-2 text-sm font-semibold text-ink-900"
        >
          <User className="size-4 text-ink-500" aria-hidden />
          Account details
        </h2>
        <div className="mt-4">
          <ProfileForm fullName={profile?.full_name ?? ""} />
        </div>
        {profile ? (
          <dl className="mt-4 divide-y divide-ink-100 border-t border-ink-100">
            <InfoRow label="Member since">
              {formatDate(profile.created_at)}
            </InfoRow>
            <InfoRow label="Account ID">
              <span className="font-mono text-xs text-ink-500">{user.id}</span>
            </InfoRow>
          </dl>
        ) : null}
      </section>

      <section
        aria-labelledby="email-heading"
        className="rounded-lg border border-ink-200 bg-white p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="email-heading"
            className="flex items-center gap-2 text-sm font-semibold text-ink-900"
          >
            <Mail className="size-4 text-ink-500" aria-hidden />
            Email address
          </h2>
          {emailConfirmed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              <ShieldCheck className="size-3.5" aria-hidden />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
              <TriangleAlert className="size-3.5" aria-hidden />
              Not verified
            </span>
          )}
        </div>
        <div className="mt-4">
          <EmailForm currentEmail={email} />
        </div>
      </section>

      <section
        aria-labelledby="password-heading"
        className="rounded-lg border border-ink-200 bg-white p-5"
      >
        <h2
          id="password-heading"
          className="flex items-center gap-2 text-sm font-semibold text-ink-900"
        >
          <KeyRound className="size-4 text-ink-500" aria-hidden />
          Password
        </h2>
        <p className="mt-2 text-sm text-ink-500">
          Choose a strong password you haven&apos;t used elsewhere. You stay
          signed in on this device after changing it.
        </p>
        <div className="mt-4">
          <ButtonLink href="/settings/password" variant="secondary">
            Change password
          </ButtonLink>
        </div>
      </section>

      <section
        aria-labelledby="membership-heading"
        className="rounded-lg border border-ink-200 bg-white p-5"
      >
        <div className="flex items-center justify-between gap-2">
          <h2
            id="membership-heading"
            className="flex items-center gap-2 text-sm font-semibold text-ink-900"
          >
            <CreditCard className="size-4 text-ink-500" aria-hidden />
            Membership
          </h2>
          <StatusBadge status={subscription?.status ?? "inactive"} />
        </div>
        {subscription ? (
          <dl className="mt-3 divide-y divide-ink-100">
            <InfoRow label="Plan">{titleCase(subscription.plan)}</InfoRow>
            <InfoRow label={isActive ? "Renews" : "Ends"}>
              {formatDate(subscription.current_period_end)}
            </InfoRow>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-ink-500">
            No active plan yet — your subscription fuels the prize pool and
            your chosen charity.
          </p>
        )}
        <div className="mt-4">
          <ButtonLink href="/subscription" variant="secondary">
            {subscription ? "Manage subscription" : "Choose a plan"}
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
