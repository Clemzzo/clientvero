import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { getCurrentAccount } from "@/server/auth/current-user";
import { unreadSummary } from "@/server/repositories/message.repository";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const account = await getCurrentAccount();

  if (!account) {
    redirect("/sign-in");
  }

  if (!account.membership) {
    redirect("/onboarding");
  }

  const organization = account.membership.organization;
  const messages = await unreadSummary(organization.id, "team");

  return (
    <AppShell user={account.user} organization={organization} messages={messages}>
      {children}
    </AppShell>
  );
}
