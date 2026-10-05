import type { ReactNode } from "react";
import Link from "next/link";

import { AppNavLink } from "@/components/layout/app-nav-link";
import { UserMenu } from "@/components/layout/user-menu";
import { PortalBrand } from "@/components/portal/PortalBrand";
import { PortalFooter } from "@/components/portal/PortalFooter";
import { portalNavigation } from "@/components/portal/portal-navigation";
import { portalSignOutAction } from "@/server/actions/portal";

type PortalShellProps = {
  slug: string;
  organizationName: string;
  clientName: string;
  email: string;
  children: ReactNode;
};

function NavLinks({ slug }: { slug: string }) {
  return portalNavigation(slug).map(({ label, href, icon: Icon, exact }) => (
    <AppNavLink key={href} href={href} exact={exact}>
      <Icon aria-hidden className="size-4" />
      {label}
    </AppNavLink>
  ));
}

export function PortalShell({ slug, organizationName, clientName, email, children }: PortalShellProps) {
  const clientMenu = <UserMenu name={clientName} email={email} onSignOut={portalSignOutAction.bind(null, slug)} />;

  return (
    <div className="min-h-dvh bg-ink-50 lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-ink-200 bg-white lg:flex">
        <div className="px-3 pt-6">
          <Link href={`/portal/${slug}`} className="block rounded-xl border border-ink-200 bg-ink-50 p-2.5 transition-colors hover:bg-ink-100">
            <PortalBrand organizationName={organizationName} />
          </Link>
        </div>

        <nav aria-label="Portal" className="flex-1 px-3 pt-6">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">Portal</p>
          <div className="space-y-1">
            <NavLinks slug={slug} />
          </div>
        </nav>

        <div className="border-t border-ink-200 px-3">
          <PortalFooter className="py-5" />
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-ink-200 bg-white lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <Link href={`/portal/${slug}`} className="min-w-0 rounded-xl">
            <PortalBrand organizationName={organizationName} />
          </Link>
          {clientMenu}
        </div>
        <nav aria-label="Portal" className="flex gap-1 overflow-x-auto px-3 pb-2">
          <NavLinks slug={slug} />
        </nav>
      </header>

      <div className="flex min-h-dvh min-w-0 flex-col">
        <header className="sticky top-0 z-20 hidden h-16 items-center justify-end border-b border-ink-200 bg-white/80 px-8 backdrop-blur lg:flex">
          {clientMenu}
        </header>
        <main className="mx-auto w-full max-w-300 flex-1 px-4 py-8 sm:px-8 lg:py-10">{children}</main>
        <PortalFooter className="lg:hidden" />
      </div>
    </div>
  );
}
