import { AppShell } from "@/components/layout/app-shell";
import type { ReactNode } from "react";

export default function WinningsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
