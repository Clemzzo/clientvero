"use client";

import { ArrowRightLeft, Check, ChevronDown } from "lucide-react";

import { useLeadStatusChange } from "@/components/leads/use-lead-status-change";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LeadStatus } from "@/db/schema";
import { leadStatusLabels, manualLeadStatuses } from "@/features/leads/lead-status";
import { cn } from "@/lib/utils";

type LeadStatusMenuProps = {
  leadId: string;
  leadName: string;
  status: LeadStatus;
  variant?: "icon" | "button";
};

export function LeadStatusMenu({ leadId, leadName, status, variant = "icon" }: LeadStatusMenuProps) {
  const { isPending, changeStatus } = useLeadStatusChange();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        aria-label={`Change status of ${leadName}`}
        className={cn(
          "inline-flex items-center gap-1.5 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:opacity-60 data-[state=open]:bg-ink-100",
          variant === "icon" && "size-8 justify-center rounded-lg",
          variant === "button" && "h-10 rounded-lg border border-ink-200 bg-white px-3.5 text-[14px] font-medium text-ink-700",
        )}
      >
        <ArrowRightLeft aria-hidden className="size-4" />
        {variant === "button" && (
          <>
            {isPending ? "Moving…" : "Move to"}
            <ChevronDown aria-hidden className="size-4" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-48">
        <DropdownMenuLabel className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-500">
          Move to
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {manualLeadStatuses.map((option) => (
          <DropdownMenuItem key={option} disabled={option === status} onSelect={() => changeStatus({ id: leadId, name: leadName }, option)}>
            <Check aria-hidden className={cn(option !== status && "invisible")} />
            {leadStatusLabels[option]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
