import Link from "next/link";
import { ArrowUpRight, Flag } from "lucide-react";

import { ProjectProgress } from "@/components/projects/ProjectProgress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { projectStatusLabels, projectStatusTones } from "@/features/projects/project-status";
import { formatDate } from "@/lib/utils/format";
import type { PortalProjectSummary } from "@/server/repositories/portal.repository";

type PortalProjectCardProps = {
  slug: string;
  project: PortalProjectSummary;
};

export function PortalProjectCard({ slug, project }: PortalProjectCardProps) {
  return (
    <Link href={`/portal/${slug}/projects/${project.id}`} className="group block h-full rounded-2xl">
      <Card className="flex h-full flex-col p-5 transition-[transform,box-shadow,border-color] duration-200 group-hover:-translate-y-0.5 group-hover:border-brand-200 group-hover:shadow-[0_8px_24px_-12px_rgba(7,11,24,0.18)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <StatusBadge label={projectStatusLabels[project.status]} tone={projectStatusTones[project.status]} />
          <ArrowUpRight
            aria-hidden
            className="size-4 text-ink-400 transition-[transform,color] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600"
          />
        </div>

        <h2 className="mt-4 font-display text-[18px] font-bold leading-snug tracking-[-0.01em] text-ink-900">{project.name}</h2>
        {project.dueDate && <p className="mt-1 text-[13px] text-ink-500">Due {formatDate(project.dueDate)}</p>}

        <div className="mt-5">
          <ProjectProgress value={project.progress} label={`${project.name} progress`} />
          <p className="mt-1.5 text-[12.5px] text-ink-500">
            {project.milestonesCompleted} of {project.milestoneTotal} milestones complete
          </p>
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-center gap-2.5 rounded-xl bg-ink-50 px-3 py-2.5 text-[13px]">
            <Flag aria-hidden className="size-4 shrink-0 text-ocean-600" />
            {project.nextMilestone ? (
              <p className="min-w-0 truncate text-ink-700">
                <span className="text-ink-500">Next: </span>
                <span className="font-medium">{project.nextMilestone.name}</span>
                {project.nextMilestone.dueDate && (
                  <span className="text-ink-500"> · {formatDate(project.nextMilestone.dueDate)}</span>
                )}
              </p>
            ) : (
              <p className="text-ink-500">{project.milestoneTotal > 0 ? "All milestones complete" : "Milestones coming soon"}</p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
