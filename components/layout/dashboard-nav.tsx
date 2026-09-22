"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CreditCard,
  Heart,
  Medal,
  Settings,
  Ticket,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/scores", label: "Scores", icon: Trophy },
  { href: "/charity", label: "Charity", icon: Heart },
  { href: "/subscription", label: "Subscription", icon: CreditCard },
  { href: "/draw", label: "Draw", icon: Ticket },
  { href: "/winnings", label: "Winnings", icon: Medal },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** Primary in-app navigation. Scrolls horizontally on small screens. */
export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Application"
      className="border-t border-ink-100 bg-white"
    >
      <ul className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                  active
                    ? "border-brand-600 text-brand-700"
                    : "border-transparent text-ink-500 hover:border-ink-200 hover:text-ink-900"
                )}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
