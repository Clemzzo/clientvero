import Link from "next/link";

import { ProjectProgress } from "@/components/projects/ProjectProgress";
import { Detail, DetailList, detailLinkStyles } from "@/components/shared/DetailList";
import { Card, CardHeader } from "@/components/ui/card";
import { formatDate, formatMoney, formatRelativeTime } from "@/lib/utils/format";
import type { ProjectDetail } from "@/server/services/project.service";

export function ProjectDetails({ project }: { project: ProjectDetail }) {
  return (
    <Card>
      <CardHeader title="Details" />
      <DetailList>
        <Detail label="Client">
          <Link href={`/dashboard/clients/${project.clientId}`} className={detailLinkStyles}>
            {project.clientName}
          </Link>
        </Detail>
        <Detail label="Progress">
          <ProjectProgress value={project.progress} label="Project progress" className="max-w-72" />
          <p className="mt-1 text-[13px] text-ink-500">
            {project.milestonesCompleted} of {project.milestoneTotal} milestones completed
          </p>
        </Detail>
        <Detail label="Budget">{project.budget && formatMoney(project.budget, project.currency)}</Detail>
        <Detail label="Start date">{project.startDate && formatDate(project.startDate)}</Detail>
        <Detail label="Due date">{project.dueDate && formatDate(project.dueDate)}</Detail>
        {project.completedAt && (
          <Detail label="Completed">
            <time dateTime={project.completedAt.toISOString()}>{formatRelativeTime(project.completedAt)}</time>
          </Detail>
        )}
        {project.proposalId && (
          <Detail label="Proposal">
            <Link href={`/dashboard/proposals/${project.proposalId}`} className={detailLinkStyles}>
              View the accepted proposal
            </Link>
          </Detail>
        )}
        <Detail label="Description">
          {project.description && <p className="whitespace-pre-line">{project.description}</p>}
        </Detail>
      </DetailList>
    </Card>
  );
}
