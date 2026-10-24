"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { visibleSettingsItems, type SettingsSectionKey } from "@/components/settings/settings-navigation";
import { cn } from "@/lib/utils";

export function SettingsNav({ sections }: { sections: SettingsSectionKey[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings" className="lg:hidden">
      <ul className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        {visibleSettingsItems(sections).map(({ key, label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={key} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand-600",
                  active ? "bg-brand-50 text-brand-700" : "text-ink-500 hover:bg-white hover:text-ink-900",
                )}
              >
                <Icon aria-hidden className="size-4" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
