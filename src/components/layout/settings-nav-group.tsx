"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Settings } from "lucide-react";

import { AppNavLink } from "@/components/layout/app-nav-link";
import { useSidebarCollapsed } from "@/components/layout/app-sidebar";
import { SETTINGS_PATH, visibleSettingsItems, type SettingsSectionKey } from "@/components/settings/settings-navigation";
import { cn } from "@/lib/utils";

const SUBNAV_ID = "settings-subnav";

export function SettingsNavGroup({ sections }: { sections: SettingsSectionKey[] }) {
  const pathname = usePathname();
  const collapsed = useSidebarCollapsed();
  const groupRef = useRef<HTMLDivElement>(null);
  const inSettings = pathname === SETTINGS_PATH || pathname.startsWith(`${SETTINGS_PATH}/`);
  const [expanded, setExpanded] = useState(inSettings);
  const [wasInSettings, setWasInSettings] = useState(inSettings);

  if (inSettings !== wasInSettings) {
    setWasInSettings(inSettings);
    setExpanded(inSettings);
  }

  useEffect(() => {
    if (!expanded) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (!groupRef.current?.contains(event.target as Node)) setExpanded(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setExpanded(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [expanded]);

  return (
    <div ref={groupRef} className="relative">
      {expanded && (
        <ul
          id={SUBNAV_ID}
          aria-label="Settings sections"
          className="menu-in absolute inset-x-0 bottom-full z-30 mb-2 space-y-0.5 rounded-xl border border-ink-200 bg-white p-1.5 shadow-[0_16px_40px_-20px_rgba(7,11,24,0.35)]"
        >
          {visibleSettingsItems(sections).map(({ key, label, href, icon: Icon }) => (
            <li key={key}>
              <AppNavLink href={href} label={label} nested icon={<Icon aria-hidden className="size-3.5 shrink-0" />} />
            </li>
          ))}
        </ul>
      )}

      <AppNavLink href={SETTINGS_PATH} label="Settings" exact icon={<Settings aria-hidden className="size-4 shrink-0" />} />
      {!collapsed && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls={SUBNAV_ID}
          aria-label={expanded ? "Hide settings sections" : "Show settings sections"}
          className="absolute inset-y-0 right-1 my-auto grid size-7 place-items-center rounded-md text-ink-500 transition-colors hover:bg-ink-200/60 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-600"
        >
          <ChevronDown
            aria-hidden
            className={cn("size-4 transition-transform duration-200 motion-reduce:transition-none", !expanded && "rotate-180")}
          />
        </button>
      )}
    </div>
  );
}
