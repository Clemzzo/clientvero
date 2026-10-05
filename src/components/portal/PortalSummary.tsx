import type { ReactNode } from "react";
import { CalendarClock, CircleCheckBig, FolderKanban } from "lucide-react";

import { IconTile } from "@/components/shared/IconTile";
import { Card } from "@/components/ui/card";
import type { AccentTone } from "@/types/accent-tone";

type PortalSummaryProps = {
  activeProjects: number;
  milestonesCompleted: number;
  milestoneTotal: number;
  nextDue: { label: string; detail: string } | null;
};

type Stat = { label: string; value: string; detail: string; icon: ReactNode; tone: AccentTone };

export function PortalSummary({ activeProjects, milestonesCompleted, milestoneTotal, nextDue }: PortalSummaryProps) {
  const stats: Stat[] = [
    {
      label: "Active projects",
      value: String(activeProjects),
      detail: "Planning, in progress or in review",
      icon: <FolderKanban />,
      tone: "ocean",
    },
    {
      label: "Milestones completed",
      value: `${milestonesCompleted}/${milestoneTotal}`,
      detail: "Across all your projects",
      icon: <CircleCheckBig />,
      tone: "mint",
    },
    {
      label: "Next due",
      value: nextDue?.label ?? "—",
      detail: nextDue?.detail ?? "Nothing scheduled yet",
      icon: <CalendarClock />,
      tone: "sun",
    },
  ];

  return (
    <ul aria-label="Summary" className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <li key={stat.label}>
          <Card className="flex h-full items-start gap-4 p-5">
            <IconTile icon={stat.icon} tone={stat.tone} size="md" />
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-ink-500">{stat.label}</p>
              <p className="mt-1 truncate font-display text-[24px] font-bold leading-tight tracking-[-0.02em] text-ink-900 tabular-nums">
                {stat.value}
              </p>
              <p className="mt-1 truncate text-[12.5px] text-ink-500">{stat.detail}</p>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
