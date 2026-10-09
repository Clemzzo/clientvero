import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ProjectProgress } from "@/components/projects/ProjectProgress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ProjectStatus } from "@/db/schema";
import { projectStatusLabels, projectStatusTones } from "@/features/projects/project-status";
import { cn } from "@/lib/utils";

type ThreadHeaderProps = {
  projectName: string;
  subtitle: string;
  status: ProjectStatus;
  progress: number;
  backHref?: string;
  backLabel?: string;
  action?: ReactNode;
  className?: string;
};

export function ThreadHeader({ projectName, subtitle, status, progress, backHref, backLabel, action, className }: ThreadHeaderProps) {
  return (
    <header className={cn("border-b border-ink-200 bg-white px-4 py-3.5 sm:px-6", className)}>
      {backHref && (
        <Link
          href={backHref}
          className="mb-1 inline-flex min-h-10 items-center gap-1.5 rounded-md text-[13px] font-medium text-ink-500 transition-colors hover:text-ink-900 lg:hidden"
        >
          <ArrowLeft aria-hidden className="size-3.5" />
          {backLabel}
        </Link>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate font-display text-[19px] font-bold leading-tight tracking-[-0.02em] text-ink-900">
            {projectName}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="truncate text-[13.5px] text-ink-500">{subtitle}</p>
            <StatusBadge label={projectStatusLabels[status]} tone={projectStatusTones[status]} />
          </div>
        </div>
        {action}
      </div>
      <ProjectProgress value={progress} label={`${projectName} progress`} className="mt-3 max-w-80" />
    </header>
  );
}
