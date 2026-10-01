import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { getCurrentAccount } from "@/server/auth/current-user";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const account = await getCurrentAccount();

  if (!account) {
    redirect("/sign-in");
  }

  if (!account.membership) {
    redirect("/onboarding");
  }

  return (
    <AppShell user={account.user} organization={account.membership.organization}>
      {children}
    </AppShell>
  );
}
