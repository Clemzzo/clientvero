import Link from "next/link";

import { cn } from "@/lib/utils";

type Tab = {
  value: string;
  label: string;
  href: string;
  count?: number;
};

type TabLinksProps = {
  label: string;
  tabs: Tab[];
  active: string;
};

export function TabLinks({ label, tabs, active }: TabLinksProps) {
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto border-b border-ink-200 px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-6">
        {tabs.map((tab) => {
          const isActive = tab.value === active;

          return (
            <li key={tab.value}>
              <Link
                href={tab.href}
                scroll={false}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 py-3 text-[14px] font-semibold transition-colors",
                  isActive ? "border-brand-600 text-brand-700" : "border-transparent text-ink-500 hover:text-ink-900",
                )}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="rounded-full bg-ink-100 px-1.5 py-px text-[12px] text-ink-700 tabular-nums">{tab.count}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
