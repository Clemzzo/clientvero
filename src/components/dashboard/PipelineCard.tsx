import Link from "next/link";
import { ArrowUpRight, Plus, UserPlus } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import type { DashboardOverview } from "@/server/repositories/dashboard.repository";
import { leadStatusLabels, openLeadStatuses, pipelineStageColors } from "@/features/leads/lead-status";
import { formatMoney } from "@/lib/utils/format";

type PipelineCardProps = {
  leads: DashboardOverview["leads"];
  currency: string;
};

export function PipelineCard({ leads, currency }: PipelineCardProps) {
  const stages = openLeadStatuses.map((status) => ({ status, count: leads.byStatus[status] }));

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Pipeline"
        description="Open leads by stage"
        action={
          leads.total > 0 && (
            <Link
              href="/dashboard/leads"
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 hover:underline"
            >
              View leads
              <ArrowUpRight aria-hidden className="size-3.5" />
            </Link>
          )
        }
      />

      {leads.total === 0 ? (
        <EmptyState
          icon={<UserPlus />}
          title="No leads yet"
          description="Add the people you're talking to and track every deal from first contact to won."
          action={
            <Button asChild size="sm" className="rounded-lg">
              <Link href="/dashboard/leads/new">
                <Plus aria-hidden className="size-4" />
                Add your first lead
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-1 flex-col px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="font-display text-[28px] font-bold tracking-[-0.03em] text-ink-900 tabular-nums">
              {formatMoney(leads.pipelineValue, currency)}
            </p>
            <p className="text-[13px] text-ink-500">
              across {leads.open} open {leads.open === 1 ? "lead" : "leads"}
            </p>
          </div>

          {leads.openInOtherCurrencies > 0 && (
            <p className="mt-1 text-[12.5px] text-ink-500">
              Excludes {leads.openInOtherCurrencies} {leads.openInOtherCurrencies === 1 ? "lead" : "leads"} valued in
              other currencies.
            </p>
          )}

          <div className="mt-5 flex h-2.5 gap-1 overflow-hidden rounded-full bg-ink-100" aria-hidden>
            {stages
              .filter((stage) => stage.count > 0)
              .map((stage) => (
                <span
                  key={stage.status}
                  className={pipelineStageColors[stage.status]}
                  style={{ flexGrow: stage.count }}
                />
              ))}
          </div>

          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
            {stages.map((stage) => (
              <li key={stage.status}>
                <span className="flex items-center gap-2 text-[12.5px] text-ink-500">
                  <span aria-hidden className={`size-2 rounded-full ${pipelineStageColors[stage.status]}`} />
                  {leadStatusLabels[stage.status]}
                </span>
                <span className="mt-1 block pl-4 text-[17px] font-semibold text-ink-900 tabular-nums">{stage.count}</span>
              </li>
            ))}
          </ul>

          <p className="mt-auto border-t border-ink-200 pt-4 text-[13px] text-ink-500">
            <span className="font-semibold text-ink-900 tabular-nums">{leads.byStatus.WON}</span> won ·{" "}
            <span className="font-semibold text-ink-900 tabular-nums">{leads.byStatus.LOST}</span> lost
          </p>
        </div>
      )}
    </Card>
  );
}
