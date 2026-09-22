import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Search, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Charity } from "@/lib/database.types";
import { SiteHeader, SiteFooter, PageContainer } from "@/components/layout/site-chrome";
import { CharityImage } from "@/components/charity/charity-image";
import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Charities",
  description:
    "Choose the cause your Digital Heroes subscription supports — from 10% to 100%.",
};

export default async function CharitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = (Array.isArray(params.q) ? params.q[0] : params.q ?? "").trim();

  const supabase = await createClient();
  let data: Charity[] | null = null;
  let failed = false;

  {
    let request = supabase
      .from("charities")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("name", { ascending: true });

    if (query) {
      request = request.ilike("name", `%${query}%`);
    }

    const { data: rows, error } = await request;
    if (error) {
      console.error("[charities] list failed:", error.message);
      failed = true;
    }
    data = rows;
  }

  const featured = data?.filter((c) => c.is_featured) ?? [];
  const rest = data?.filter((c) => !c.is_featured) ?? [];
  const charities = query ? (data ?? []) : [...featured, ...rest];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />

      <section className="border-b border-ink-100 bg-ink-50">
        <PageContainer className="py-10 sm:py-12">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-brand-700">
            <Heart className="size-4" aria-hidden />
            Charities
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-ink-900 sm:text-3xl">
            Back the cause you care about
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500 sm:text-base">
            Every subscription contributes at least 10% to a charity of your
            choice — and you can raise your contribution up to 100%.
          </p>
        </PageContainer>
      </section>

      <section className="flex-1 bg-white">
        <PageContainer className="py-8 sm:py-10">
          <form
            role="search"
            action="/charities"
            className="flex w-full max-w-md items-center gap-2"
          >
            <label htmlFor="charity-search" className="sr-only">
              Search charities
            </label>
            <Input
              id="charity-search"
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search charities…"
              className="flex-1"
            />
            <button
              type="submit"
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
            >
              <Search className="size-4" aria-hidden />
              Search
            </button>
          </form>

          {failed ? (
            <Alert variant="error" className="mt-6">
              We couldn&apos;t load the charities right now. Please try again
              shortly.
            </Alert>
          ) : !data || data.length === 0 ? (
            <div className="mt-6 border-t border-ink-100 pt-10 text-center">
              <Heart className="mx-auto size-8 text-ink-300" aria-hidden />
              <p className="mt-3 text-sm font-medium text-ink-800">
                {query ? `No charities match “${query}”.` : "No charities listed yet."}
              </p>
              {query ? (
                <Link
                  href="/charities"
                  className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:text-brand-800"
                >
                  Clear search
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="mt-8">
              {featured.length > 0 && !query ? (
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-500">
                  Featured
                </h2>
              ) : null}
              <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {charities.map((charity) => (
                  <li key={charity.id} className="border-t-2 border-brand-600 pt-4">
                    <Link
                      href={`/charities/${charity.id}`}
                      className="group block focus-visible:outline-offset-4"
                    >
                      <div className="flex items-start gap-4">
                        <CharityImage
                          src={charity.image_url}
                          alt={charity.name}
                          className="size-16 shrink-0 rounded-md"
                          iconClassName="size-6"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="truncate text-base font-semibold text-ink-900 group-hover:text-brand-700">
                              {charity.name}
                            </h3>
                            {charity.is_featured ? (
                              <Star
                                className="size-4 shrink-0 fill-amber-400 text-amber-400"
                                aria-label="Featured charity"
                              />
                            ) : null}
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-ink-500">
                            {charity.description ?? ""}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-12 border-t border-ink-100 pt-8 text-center">
            <h2 className="text-lg font-semibold text-ink-900">
              Ready to start contributing?
            </h2>
            <p className="mx-auto mt-1 max-w-lg text-sm text-ink-500">
              Create an account, pick a charity, and choose how much of your
              subscription goes to it.
            </p>
            <ButtonLink href="/signup" size="lg" className="mt-5">
              Get started
            </ButtonLink>
          </div>
        </PageContainer>
      </section>

      <SiteFooter />
    </div>
  );
}
