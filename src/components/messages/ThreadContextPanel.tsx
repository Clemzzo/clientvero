import Link from "next/link";
import { Flag } from "lucide-react";

import { IconTile } from "@/components/shared/IconTile";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/format";

type ThreadContextPanelProps = {
  projectHref: string;
  milestonesCompleted: number;
  milestoneTotal: number;
  nextMilestone: { name: string; dueDate: string | null } | null;
};

export function ThreadContextPanel({ projectHref, milestonesCompleted, milestoneTotal, nextMilestone }: ThreadContextPanelProps) {
  return (
    <aside aria-label="Project details" className="hidden w-72 shrink-0 flex-col gap-5 border-l border-ink-200 bg-white p-5 xl:flex">
      <div>
        <h3 className="text-[13px] font-semibold text-ink-900">Next milestone</h3>
        {nextMilestone ? (
          <div className="mt-3 flex items-start gap-3">
            <IconTile icon={<Flag />} tone="sun" />
            <div className="min-w-0">
              <p className="text-[14px] font-semibold leading-snug text-ink-900">{nextMilestone.name}</p>
              <p className="mt-0.5 text-[13px] text-ink-500">
                {nextMilestone.dueDate ? `Due ${formatDate(nextMilestone.dueDate)}` : "No due date"}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-[13.5px] text-ink-500">
            {milestoneTotal === 0 ? "This project has no milestones yet." : "Every milestone is complete."}
          </p>
        )}
      </div>

      {milestoneTotal > 0 && (
        <p className="text-[13.5px] text-ink-500">
          <span className="font-semibold text-ink-900 tabular-nums">{milestonesCompleted}</span> of{" "}
          <span className="tabular-nums">{milestoneTotal}</span> milestones complete
        </p>
      )}

      <Button asChild variant="outline" className="h-10 rounded-lg">
        <Link href={projectHref}>Open project</Link>
      </Button>
    </aside>
  );
}
