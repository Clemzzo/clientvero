"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LeadStatus } from "@/db/schema";
import { leadStatusLabels, leadStatuses } from "@/features/leads/lead-status";

const ALL_STATUSES = "all";

type LeadStatusFilterProps = {
  q: string;
  status?: LeadStatus;
};

function filterHref(q: string, status: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status !== ALL_STATUSES) params.set("status", status);
  const search = params.toString();
  return search ? `/dashboard/leads?${search}` : "/dashboard/leads";
}

export function LeadStatusFilter({ q, status }: LeadStatusFilterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function applyStatus(value: string) {
    startTransition(() => router.push(filterHref(q, value)));
  }

  return (
    <Select value={status ?? ALL_STATUSES} onValueChange={applyStatus} disabled={isPending}>
      <SelectTrigger aria-label="Filter by status" className="sm:w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
        {leadStatuses.map((option) => (
          <SelectItem key={option} value={option}>
            {leadStatusLabels[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
