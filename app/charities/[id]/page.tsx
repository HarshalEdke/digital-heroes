import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader, SiteFooter, PageContainer } from "@/components/layout/site-chrome";
import { CharityImage } from "@/components/charity/charity-image";
import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("charities")
    .select("name, description")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  return {
    title: data?.name ?? "Charity",
    description: data?.description ?? undefined,
  };
}

export default async function CharityDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: charity, error } = await supabase
    .from("charities")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[charity] detail failed:", error.message);
  }

  if (!charity) notFound();

  const events = charity.events
    ? charity.events.split(",").map((e) => e.trim()).filter(Boolean)
    : [];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />

      <PageContainer className="flex-1 py-8 sm:py-10">
        <Link
          href="/charities"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All charities
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <CharityImage
              src={charity.image_url}
              alt={charity.name}
              className="aspect-[16/7] w-full rounded-lg"
              iconClassName="size-10"
            />
            <h1 className="mt-6 flex flex-wrap items-center gap-2 text-2xl font-semibold text-ink-900 sm:text-3xl">
              {charity.name}
            </h1>
            {charity.description ? (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-600 sm:text-base">
                {charity.description}
              </p>
            ) : null}
          </div>

          <aside className="lg:col-span-2">
            <div className="border-t-2 border-brand-600 pt-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-ink-500">
                <Heart className="size-4" aria-hidden />
                Events
              </h2>
              {events.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {events.map((event) => (
                    <li
                      key={event}
                      className="flex items-start gap-2 text-sm text-ink-800"
                    >
                      <Calendar className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                      {event}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-ink-500">
                  No upcoming events announced yet.
                </p>
              )}
            </div>

            <div className="mt-8 border-t border-ink-100 pt-6">
              <h2 className="text-base font-semibold text-ink-900">
                Support this cause
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Choose {charity.name} as your charity and contribute from 10%
                of your subscription.
              </p>
              <ButtonLink href="/signup" className="mt-4 w-full sm:w-auto">
                Get started
              </ButtonLink>
            </div>
          </aside>
        </div>

        {error ? (
          <Alert variant="error" className="mt-8">
            Some details may be unavailable right now.
          </Alert>
        ) : null}
      </PageContainer>

      <SiteFooter />
    </div>
  );
}
