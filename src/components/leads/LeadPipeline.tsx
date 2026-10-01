import Link from "next/link";

import { LeadPipelineBoard } from "@/components/leads/LeadPipelineBoard";
import type { LeadPipelineResult } from "@/server/repositories/lead.repository";

type LeadPipelineProps = {
  pipeline: LeadPipelineResult;
  canUpdate: boolean;
};

export function LeadPipeline({ pipeline, canUpdate }: LeadPipelineProps) {
  return (
    <div className="space-y-4">
      <LeadPipelineBoard columns={pipeline.columns} canUpdate={canUpdate} now={new Date()} />

      <p className="flex flex-wrap gap-x-5 gap-y-1 text-[14px] text-ink-500">
        <Link href="/dashboard/leads?status=WON" className="hover:text-ink-900">
          <span className="font-semibold text-ink-900 tabular-nums">{pipeline.closed.WON}</span> won
        </Link>
        <Link href="/dashboard/leads?status=LOST" className="hover:text-ink-900">
          <span className="font-semibold text-ink-900 tabular-nums">{pipeline.closed.LOST}</span> lost
        </Link>
      </p>
    </div>
  );
}
