import type { ReactNode } from "react";
import Link from "next/link";

import { LeadStatusMenu } from "@/components/leads/LeadStatusMenu";
import type { Lead } from "@/db/schema";
import { leadValue } from "@/features/leads/lead-display";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/format";

type LeadCardProps = {
  lead: Lead;
  canUpdate: boolean;
  now: Date;
  dragHandle?: ReactNode;
  isDragging?: boolean;
};

export function LeadCard({ lead, canUpdate, now, dragHandle, isDragging = false }: LeadCardProps) {
  const value = leadValue(lead);

  return (
    <article
      className={cn(
        "rounded-xl border border-ink-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(7,11,24,0.04)] transition-[box-shadow,opacity] hover:shadow-[0_8px_24px_-16px_rgba(7,11,24,0.3)]",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-start gap-2">
        {dragHandle}
        <div className="min-w-0 flex-1">
          <Link
            href={`/dashboard/leads/${lead.id}`}
            className="block truncate text-[14px] font-semibold text-ink-900 hover:text-brand-700"
          >
            {lead.name}
          </Link>
          {lead.company && <p className="truncate text-[13px] text-ink-500">{lead.company}</p>}
        </div>
        {canUpdate && <LeadStatusMenu leadId={lead.id} leadName={lead.name} status={lead.status} />}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-[12.5px]">
        <span className="font-semibold text-ink-900 tabular-nums">{value ?? "No value"}</span>
        <time dateTime={lead.createdAt.toISOString()} className="text-ink-500">
          {formatRelativeTime(lead.createdAt, now)}
        </time>
      </div>
    </article>
  );
}
