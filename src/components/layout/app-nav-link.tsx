"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { UnreadBadge } from "@/components/shared/UnreadBadge";
import { cn } from "@/lib/utils";

type AppNavLinkProps = {
  href: string;
  exact?: boolean;
  badge?: number;
  children: ReactNode;
};

export function AppNavLink({ href, exact = false, badge = 0, children }: AppNavLinkProps) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors",
        active ? "bg-brand-50 text-brand-700" : "text-ink-500 hover:bg-ink-100 hover:text-ink-900",
      )}
    >
      {children}
      <UnreadBadge count={badge} className="ml-auto" />
    </Link>
  );
}
