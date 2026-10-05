import { Check, Circle } from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import type { MilestoneStatus } from "@/db/schema";
import { milestoneStatusLabels, milestoneStatusTones } from "@/features/projects/milestone-status";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";
import type { PortalMilestone } from "@/server/repositories/portal.repository";

function StepIcon({ status }: { status: MilestoneStatus }) {
  if (status === "COMPLETED") {
    return (
      <span className="grid size-8 place-items-center rounded-full bg-mint-600 text-white">
        <Check aria-hidden className="size-4" strokeWidth={3} />
      </span>
    );
  }

  if (status === "IN_PROGRESS") {
    return (
      <span className="grid size-8 place-items-center rounded-full bg-ocean-50 ring-2 ring-ocean-500">
        <span className="size-2.5 animate-pulse rounded-full bg-ocean-600" />
      </span>
    );
  }

  return (
    <span className="grid size-8 place-items-center rounded-full border-2 border-ink-200 bg-white text-ink-200">
      <Circle aria-hidden className="size-2.5 fill-current" />
    </span>
  );
}

export function MilestoneTimeline({ milestones, today }: { milestones: PortalMilestone[]; today: string }) {
  return (
    <ol>
      {milestones.map((milestone, index) => {
        const overdue = milestone.status !== "COMPLETED" && milestone.dueDate !== null && milestone.dueDate < today;
        const isLast = index === milestones.length - 1;

        return (
          <li key={milestone.id} className="relative flex gap-4 pb-7 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[15px] top-9 h-[calc(100%-36px)] w-0.5 rounded-full",
                  milestone.status === "COMPLETED" ? "bg-mint-500" : "bg-ink-200",
                )}
              />
            )}
            <StepIcon status={milestone.status} />

            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <h3
                  className={cn(
                    "text-[15px] font-semibold text-ink-900",
                    milestone.status === "COMPLETED" && "text-ink-700",
                  )}
                >
                  {milestone.name}
                </h3>
                <StatusBadge label={milestoneStatusLabels[milestone.status]} tone={milestoneStatusTones[milestone.status]} />
                {overdue && <StatusBadge label="Overdue" tone="danger" />}
              </div>
              {milestone.description && (
                <p className="mt-1.5 whitespace-pre-line text-[14px] leading-relaxed text-ink-500">{milestone.description}</p>
              )}
              <p className="mt-1.5 text-[12.5px] text-ink-500">
                {milestone.status === "COMPLETED" && milestone.completedAt
                  ? `Completed ${formatDate(milestone.completedAt.toISOString().slice(0, 10))}`
                  : milestone.dueDate
                    ? `Due ${formatDate(milestone.dueDate)}`
                    : "No due date yet"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
