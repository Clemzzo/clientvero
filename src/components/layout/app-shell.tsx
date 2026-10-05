import type { ReactNode } from "react";

import { AppNavLink } from "@/components/layout/app-nav-link";
import { appNavigation } from "@/components/layout/app-navigation";
import { Logo } from "@/components/layout/logo";
import { UserMenu } from "@/components/layout/user-menu";
import { NoticeProvider } from "@/components/shared/notice-provider";
import type { Organization, User } from "@/db/schema";
import { signOutAction } from "@/server/actions/auth";

type AppShellProps = {
  user: User;
  organization: Organization;
  children: ReactNode;
};

function displayName(user: User) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
}

function NavLinks() {
  return appNavigation.map(({ label, href, icon: Icon, exact }) => (
    <AppNavLink key={href} href={href} exact={exact}>
      <Icon aria-hidden className="size-4" />
      {label}
    </AppNavLink>
  ));
}

function WorkspaceBadge({ organization }: { organization: Organization }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 p-2.5">
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-600 font-display text-[15px] font-bold text-white"
      >
        {organization.name.trim().charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[14px] font-semibold text-ink-900">{organization.name}</p>
        <p className="truncate text-[12.5px] text-ink-500">{organization.businessType ?? "Workspace"}</p>
      </div>
    </div>
  );
}

export function AppShell({ user, organization, children }: AppShellProps) {
  const name = displayName(user);

  return (
    <div className="min-h-dvh bg-ink-50 lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-ink-200 bg-white lg:flex">
        <div className="px-5 pt-6">
          <Logo href="/dashboard" className="h-9 w-auto" />
        </div>

        <div className="px-3 pt-6">
          <WorkspaceBadge organization={organization} />
        </div>

        <nav aria-label="Main" className="flex-1 px-3 pt-6">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">Workspace</p>
          <div className="space-y-1">
            <NavLinks />
          </div>
        </nav>
      </aside>

      <header className="sticky top-0 z-20 border-b border-ink-200 bg-white lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <Logo href="/dashboard" className="h-8 w-auto" />
          <UserMenu name={name} email={user.email} onSignOut={signOutAction} />
        </div>
        <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-3 pb-2">
          <NavLinks />
        </nav>
      </header>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 hidden h-16 items-center justify-end border-b border-ink-200 bg-white/80 px-8 backdrop-blur lg:flex">
          <UserMenu name={name} email={user.email} onSignOut={signOutAction} />
        </header>
        <main>
          <NoticeProvider>{children}</NoticeProvider>
        </main>
      </div>
    </div>
  );
}
