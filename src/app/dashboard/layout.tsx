import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { SIDEBAR_COOKIE } from "@/components/layout/app-sidebar";
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
  const [messages, cookieStore] = await Promise.all([unreadSummary(organization.id, "team"), cookies()]);
  const sidebarCollapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === "collapsed";

  return (
    <AppShell user={account.user} organization={organization} messages={messages} sidebarCollapsed={sidebarCollapsed}>
      {children}
    </AppShell>
  );
}
