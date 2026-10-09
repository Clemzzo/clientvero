"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { createContext, useContext, useState, type ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const SIDEBAR_COOKIE = "cv_sidebar";

const SidebarContext = createContext({ collapsed: false });

export function useSidebarCollapsed() {
  return useContext(SidebarContext).collapsed;
}

type AppSidebarProps = {
  defaultCollapsed: boolean;
  logo: ReactNode;
  children: ReactNode;
};

export function AppSidebar({ defaultCollapsed, logo, children }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next ? "collapsed" : "expanded"}; path=/; max-age=31536000; samesite=lax`;
  }

  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <TooltipProvider delayDuration={150}>
        <aside
          id="app-sidebar"
          data-collapsed={collapsed}
          className={cn(
            "group/sidebar sticky top-0 hidden h-dvh flex-col overflow-hidden whitespace-nowrap border-r border-ink-200 bg-white transition-[width] duration-200 ease-out motion-reduce:transition-none lg:flex",
            collapsed ? "w-18" : "w-64",
          )}
        >
          <div className={cn("flex items-center pt-6", collapsed ? "justify-center px-3" : "justify-between gap-2 pl-5 pr-3")}>
            {!collapsed && logo}
            <button
              type="button"
              onClick={toggle}
              aria-controls="app-sidebar"
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-600"
            >
              <ToggleIcon aria-hidden className="size-4.5" />
            </button>
          </div>
          {children}
        </aside>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}
