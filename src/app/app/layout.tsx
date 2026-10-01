import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentAccount } from "@/server/auth/current-user";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const account = await getCurrentAccount();

  if (!account) {
    redirect("/sign-in");
  }

  if (!account.membership) {
    redirect("/onboarding");
  }

  return <main className="min-h-dvh bg-ink-50">{children}</main>;
}
