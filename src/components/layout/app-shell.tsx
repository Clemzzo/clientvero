import type { ReactNode } from "react";

import { AppNavLink } from "@/components/layout/app-nav-link";
import { appNavigation, settingsNavItem } from "@/components/layout/app-navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Logo } from "@/components/layout/logo";
import { SettingsNavGroup } from "@/components/layout/settings-nav-group";
import { TimeZoneSync } from "@/components/layout/time-zone-sync";
import { UserMenu } from "@/components/layout/user-menu";
import { InboxPoller } from "@/components/messages/InboxPoller";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import type { SettingsSectionKey } from "@/components/settings/settings-navigation";
import { NoticeProvider } from "@/components/shared/notice-provider";
import { WorkspaceLogo } from "@/components/shared/WorkspaceLogo";
import type { Organization, User } from "@/db/schema";
import { avatarSrc, logoSrc } from "@/features/settings/image-urls";
import { personName } from "@/lib/utils/format";
import { signOutAction } from "@/server/actions/auth";
import { pollShellSummaryAction } from "@/server/actions/notifications";
import type { ShellSummary } from "@/server/services/shell-summary.service";

type AppShellProps = {
  user: User;
  organization: Organization;
  summary: ShellSummary;
  settingsSections: SettingsSectionKey[];
  sidebarCollapsed: boolean;
  children: ReactNode;
};

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

function SettingsLink() {
  const { label, href, icon: Icon } = settingsNavItem;
  return <AppNavLink href={href} label={label} icon={<Icon aria-hidden className="size-4 shrink-0" />} />;
}

function WorkspaceBadge({ organization }: { organization: Organization }) {
  return (
    <div
      title={organization.name}
      className="flex items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 p-2.5 group-data-[collapsed=true]/sidebar:justify-center group-data-[collapsed=true]/sidebar:border-transparent group-data-[collapsed=true]/sidebar:bg-transparent group-data-[collapsed=true]/sidebar:p-0"
    >
      <WorkspaceLogo name={organization.name} src={logoSrc(organization.slug, organization.logoKey)} />
      <div className="min-w-0 group-data-[collapsed=true]/sidebar:sr-only">
        <p className="truncate text-[14px] font-semibold text-ink-900">{organization.name}</p>
        <p className="truncate text-[12.5px] text-ink-500">{organization.businessType ?? "Workspace"}</p>
      </div>
    </div>
  );
}

export function AppShell({ user, organization, summary, settingsSections, sidebarCollapsed, children }: AppShellProps) {
  const name = personName(user);
  const userMenu = (
    <UserMenu
      name={name}
      email={user.email}
      avatarSrc={avatarSrc(user.id, user.avatarKey)}
      showAccountLinks
      onSignOut={signOutAction}
    />
  );

  return (
    <div className="min-h-dvh bg-ink-50 lg:grid lg:grid-cols-[auto_minmax(0,1fr)]">
      <AppSidebar defaultCollapsed={sidebarCollapsed} logo={<Logo href="/dashboard" className="h-9 w-auto" />}>
        <div className="px-3 pt-6">
          <WorkspaceBadge organization={organization} />
        </div>

        <nav aria-label="Main" className="min-h-0 flex-1 overflow-y-auto px-3 pt-6">
          <p className="px-3 pb-2 text-[11px] group-data-[collapsed=true]/sidebar:sr-only font-semibold uppercase tracking-[0.14em] text-ink-500">Workspace</p>
          <div className="space-y-1">
            <NavLinks unreadMessages={summary.messages.unread} />
          </div>
        </nav>

        <div className="border-t border-ink-200 px-3 py-4">
          <SettingsNavGroup sections={settingsSections} />
        </div>
      </AppSidebar>

      <header className="sticky top-0 z-20 border-b border-ink-200 bg-white lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <Logo href="/dashboard" className="h-8 w-auto" />
          <div className="flex items-center gap-1">
            <NotificationBell unread={summary.notifications.unread} />
            {userMenu}
          </div>
        </div>
        <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-3 pb-2">
          <NavLinks unreadMessages={summary.messages.unread} />
          <SettingsLink />
        </nav>
      </header>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 hidden h-16 items-center justify-end border-b border-ink-200 bg-white/80 px-8 backdrop-blur lg:flex">
          <div className="flex items-center gap-2">
            <NotificationBell unread={summary.notifications.unread} />
            {userMenu}
          </div>
        </header>
        <main>
          <NoticeProvider>{children}</NoticeProvider>
          <InboxPoller initial={summary} poll={pollShellSummaryAction} />
          <TimeZoneSync saved={user.timezone} />
        </main>
      </div>
    </div>
  );
}
