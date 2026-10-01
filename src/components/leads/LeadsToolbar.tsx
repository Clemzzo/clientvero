import Link from "next/link";
import { Columns3, List } from "lucide-react";

import { LeadStatusFilter } from "@/components/leads/LeadStatusFilter";
import { SearchForm } from "@/components/shared/SearchForm";
import { cn } from "@/lib/utils";
import type { LeadListQuery } from "@/validators/leads";

type LeadsToolbarProps = {
  query: LeadListQuery;
};

const views = [
  { value: "list", label: "List", icon: List },
  { value: "pipeline", label: "Pipeline", icon: Columns3 },
] as const;

function viewHref(view: LeadListQuery["view"], q: string) {
  const params = new URLSearchParams();
  if (view === "pipeline") params.set("view", view);
  if (q) params.set("q", q);
  const search = params.toString();
  return search ? `/dashboard/leads?${search}` : "/dashboard/leads";
}

export function LeadsToolbar({ query }: LeadsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row">
        <SearchForm
          action="/dashboard/leads"
          label="Search leads"
          placeholder="Search name, email or company"
          defaultValue={query.q}
          hiddenFields={{ view: query.view === "pipeline" ? "pipeline" : undefined, status: query.status }}
        />

        {query.view === "list" && <LeadStatusFilter q={query.q} status={query.status} />}
      </div>

      <nav aria-label="Leads view" className="inline-flex self-start rounded-lg border border-ink-200 bg-white p-1">
        {views.map(({ value, label, icon: Icon }) => {
          const active = query.view === value;
          return (
            <Link
              key={value}
              href={viewHref(value, query.q)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-semibold transition-colors",
                active ? "bg-brand-50 text-brand-700" : "text-ink-500 hover:text-ink-900",
              )}
            >
              <Icon aria-hidden className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
