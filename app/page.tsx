import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SiteHeader, SiteFooter, PageContainer } from "@/components/layout/site-chrome";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Digital Heroes — Play better golf. Back great causes.",
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=2000&q=80";

const steps = [
  {
    title: "Subscribe",
    body: "Pick a monthly or yearly plan. Your subscription fuels the prize pool and your chosen charity.",
  },
  {
    title: "Play & log scores",
    body: "Submit your Stableford scores after each round. Your best five stay in play.",
  },
  {
    title: "Enter the monthly draw",
    body: "Match 5, 4 or 3 numbers to win. Verify your result, get paid, and back your cause.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />

      <section
        className="relative flex min-h-[420px] items-center bg-ink-900 bg-cover bg-center sm:min-h-[520px]"
        style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
        aria-label="Golf course at sunrise"
      >
        <div className="absolute inset-0 bg-ink-950/45" aria-hidden />
        <PageContainer className="relative py-16 sm:py-24">
          <p className="max-w-xl text-sm font-semibold uppercase tracking-[0.12em] text-brand-200">
            Golf · Charity · Rewards
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
            Play better golf. Back great causes. Win every month.
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/90 sm:text-lg">
            Digital Heroes turns your Stableford scores into monthly draw
            entries — while a share of every subscription goes to the charity
            you choose.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/signup" size="lg">
              Join now
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
            <ButtonLink
              href="/charities"
              variant="secondary"
              size="lg"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20"
            >
              Explore charities
            </ButtonLink>
          </div>
        </PageContainer>
      </section>

      <section className="border-b border-ink-100 bg-white">
        <PageContainer className="py-14 sm:py-16">
          <h2 className="text-xl font-semibold text-ink-900 sm:text-2xl">
            How it works
          </h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="border-t-2 border-brand-600 pt-4">
                <span className="text-sm font-semibold text-brand-700">
                  Step {index + 1}
                </span>
                <h3 className="mt-1 text-lg font-semibold text-ink-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </PageContainer>
      </section>

      <section className="border-b border-ink-100 bg-ink-50">
        <PageContainer className="py-14 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold text-ink-900 sm:text-2xl">
                Every round counts. Every rupee is accounted for.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-500 sm:text-base">
                At least 10% of every subscription goes to charity — you choose
                the cause and can raise your contribution up to 100%. Prize
                pools split 40/35/25 across the 5, 4 and 3 number tiers, with
                the jackpot rolling over when nobody matches five.
              </p>
              <Link
                href="/signup"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                Create your account
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <ul className="space-y-3">
              {[
                "Monthly and yearly plans",
                "Choose your charity, from 10% to 100% contribution",
                "Latest five Stableford scores tracked per round",
                "Monthly draw with verified payouts",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-ink-800"
                >
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-brand-600"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </PageContainer>
      </section>

      <section className="bg-brand-700">
        <PageContainer className="py-12 text-center sm:py-14">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            Ready to play for something bigger?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-brand-100 sm:text-base">
            Create a free account to explore charities and see how the monthly
            draw works.
          </p>
          <ButtonLink
            href="/signup"
            size="lg"
            className="mt-6 bg-white text-brand-800 hover:bg-brand-50"
          >
            Get started
          </ButtonLink>
        </PageContainer>
      </section>

      <SiteFooter />
    </div>
  );
}
