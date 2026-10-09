import type { ReactNode } from "react";

import { AppNavLink } from "@/components/layout/app-nav-link";
import { appNavigation } from "@/components/layout/app-navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Logo } from "@/components/layout/logo";
import { UserMenu } from "@/components/layout/user-menu";
import { InboxPoller } from "@/components/messages/InboxPoller";
import { NoticeProvider } from "@/components/shared/notice-provider";
import type { Organization, User } from "@/db/schema";
import { signOutAction } from "@/server/actions/auth";
import { pollInboxSummaryAction } from "@/server/actions/messages";
import type { UnreadSummary } from "@/server/repositories/message.repository";

type AppShellProps = {
  user: User;
  organization: Organization;
  messages: UnreadSummary;
  sidebarCollapsed: boolean;
  children: ReactNode;
};

function displayName(user: User) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
}

function NavLinks({ unreadMessages }: { unreadMessages: number }) {
  return appNavigation.map(({ label, href, icon: Icon, exact, badge }) => (
    <AppNavLink
      key={href}
      href={href}
      label={label}
      icon={<Icon aria-hidden className="size-4 shrink-0" />}
      exact={exact}
      badge={badge === "messages" ? unreadMessages : 0}
    />
  ));
}

function WorkspaceBadge({ organization }: { organization: Organization }) {
  return (
    <div
      title={organization.name}
      className="flex items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 p-2.5 group-data-[collapsed=true]/sidebar:justify-center group-data-[collapsed=true]/sidebar:border-transparent group-data-[collapsed=true]/sidebar:bg-transparent group-data-[collapsed=true]/sidebar:p-0"
    >
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-600 font-display text-[15px] font-bold text-white"
      >
        {organization.name.trim().charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 group-data-[collapsed=true]/sidebar:sr-only">
        <p className="truncate text-[14px] font-semibold text-ink-900">{organization.name}</p>
        <p className="truncate text-[12.5px] text-ink-500">{organization.businessType ?? "Workspace"}</p>
      </div>
    </div>
  );
}

export function AppShell({ user, organization, messages, sidebarCollapsed, children }: AppShellProps) {
  const name = displayName(user);

  return (
    <div className="min-h-dvh bg-ink-50 lg:grid lg:grid-cols-[auto_minmax(0,1fr)]">
      <AppSidebar defaultCollapsed={sidebarCollapsed} logo={<Logo href="/dashboard" className="h-9 w-auto" />}>
        <div className="px-3 pt-6">
          <WorkspaceBadge organization={organization} />
        </div>

        <nav aria-label="Main" className="flex-1 px-3 pt-6">
          <p className="px-3 pb-2 text-[11px] group-data-[collapsed=true]/sidebar:sr-only font-semibold uppercase tracking-[0.14em] text-ink-500">Workspace</p>
          <div className="space-y-1">
            <NavLinks unreadMessages={messages.unread} />
          </div>
        </nav>
      </AppSidebar>

      <header className="sticky top-0 z-20 border-b border-ink-200 bg-white lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <Logo href="/dashboard" className="h-8 w-auto" />
          <UserMenu name={name} email={user.email} onSignOut={signOutAction} />
        </div>
        <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-3 pb-2">
          <NavLinks unreadMessages={messages.unread} />
        </nav>
      </header>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 hidden h-16 items-center justify-end border-b border-ink-200 bg-white/80 px-8 backdrop-blur lg:flex">
          <UserMenu name={name} email={user.email} onSignOut={signOutAction} />
        </header>
        <main>
          <NoticeProvider>{children}</NoticeProvider>
          <InboxPoller initial={messages} poll={pollInboxSummaryAction} />
        </main>
      </div>
    </div>
  );
}
