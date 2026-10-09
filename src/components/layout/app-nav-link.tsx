"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useSidebarCollapsed } from "@/components/layout/app-sidebar";
import { UnreadBadge } from "@/components/shared/UnreadBadge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type AppNavLinkProps = {
  href: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
  badge?: number;
};

export function AppNavLink({ href, label, icon, exact = false, badge = 0 }: AppNavLinkProps) {
  const pathname = usePathname();
  const collapsed = useSidebarCollapsed();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const link = (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex shrink-0 items-center gap-2.5 rounded-lg py-2 text-[14px] font-medium transition-colors",
        collapsed ? "justify-center px-0" : "px-3",
        active ? "bg-brand-50 text-brand-700" : "text-ink-500 hover:bg-ink-100 hover:text-ink-900",
      )}
    >
      {icon}
      <span className={cn(collapsed && "sr-only")}>{label}</span>
      <UnreadBadge count={badge} className={collapsed ? "absolute -top-1 right-0.5" : "ml-auto"} />
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
