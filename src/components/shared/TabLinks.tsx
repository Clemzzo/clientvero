import Link from "next/link";

import { UnreadBadge } from "@/components/shared/UnreadBadge";
import { cn } from "@/lib/utils";

type Tab = {
  value: string;
  label: string;
  href: string;
  count?: number;
  unread?: number;
};

type TabLinksProps = {
  label: string;
  tabs: Tab[];
  active: string;
  className?: string;
};

export function TabLinks({ label, tabs, active, className }: TabLinksProps) {
  return (
    <nav
      aria-label={label}
      className={cn(
        "-mx-4 overflow-x-auto overflow-y-hidden px-4 shadow-[inset_0_-1px_0_var(--color-ink-200)] scrollbar-none sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
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
                  "inline-flex items-center gap-2 whitespace-nowrap border-b-2 py-3 text-[14px] font-semibold transition-colors",
                  isActive ? "border-brand-600 text-brand-700" : "border-transparent text-ink-500 hover:text-ink-900",
                )}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="rounded-full bg-ink-100 px-1.5 py-px text-[12px] text-ink-700 tabular-nums">{tab.count}</span>
                )}
                {tab.unread !== undefined && <UnreadBadge count={tab.unread} />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
