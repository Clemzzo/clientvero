import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck, CalendarDays, Flag, FolderOpen, MessagesSquare } from "lucide-react";

import { MilestoneTimeline } from "@/components/portal/MilestoneTimeline";
import { PortalFileList } from "@/components/portal/PortalFileList";
import { ProjectProgress } from "@/components/projects/ProjectProgress";
import { EmptyState } from "@/components/shared/EmptyState";
import { IconTile } from "@/components/shared/IconTile";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UnreadBadge } from "@/components/shared/UnreadBadge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { projectStatusLabels, projectStatusTones } from "@/features/projects/project-status";
import { formatDate } from "@/lib/utils/format";
import { requirePortalContext } from "@/server/auth/portal-session";
import { NotFoundError } from "@/server/errors";
import { listPortalProjectFiles } from "@/server/repositories/file.repository";
import { unreadByProject } from "@/server/repositories/message.repository";
import { getPortalProject, listPortalMilestones } from "@/server/repositories/portal.repository";
import { projectIdSchema } from "@/validators/projects";

async function loadProject(slug: string, id: string) {
  const context = await requirePortalContext(slug);
  const projectId = projectIdSchema.safeParse(id);

  if (!projectId.success) {
    notFound();
  }

  try {
    const [project, milestones, files, unreadMessages] = await Promise.all([
      getPortalProject(context, projectId.data),
      listPortalMilestones(context, projectId.data),
      listPortalProjectFiles(context, projectId.data),
      unreadByProject(context.organization.id, "client", projectId.data, context.client.id),
    ]);
    return { context, project, milestones, files, unreadMessages };
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
}

export async function generateMetadata(props: PageProps<"/portal/[slug]/projects/[id]">): Promise<Metadata> {
  const { slug, id } = await props.params;
  const { project } = await loadProject(slug, id);
  return { title: project.name };
}

export default async function PortalProjectPage(props: PageProps<"/portal/[slug]/projects/[id]">) {
  const { slug, id } = await props.params;
  const { context, project, milestones, files, unreadMessages } = await loadProject(slug, id);
  const today = new Date().toISOString().slice(0, 10);

  const dates = [
    { label: "Started", value: project.startDate, icon: <CalendarDays />, tone: "ocean" as const },
    { label: "Due", value: project.dueDate, icon: <Flag />, tone: "sun" as const },
    {
      label: "Completed",
      value: project.completedAt ? project.completedAt.toISOString().slice(0, 10) : null,
      icon: <CalendarCheck />,
      tone: "mint" as const,
    },
  ].flatMap((date) => (date.value ? [{ ...date, value: date.value }] : []));

  return (
    <div className="space-y-8">
      <Link
        href={`/portal/${context.organization.slug}/projects`}
        className="inline-flex items-center gap-1.5 rounded-md text-[14px] font-medium text-ink-500 transition-colors hover:text-ink-900"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Projects
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <StatusBadge label={projectStatusLabels[project.status]} tone={projectStatusTones[project.status]} />
          <h1 className="mt-3 font-display text-[clamp(26px,2.6vw,34px)] font-extrabold leading-[1.15] tracking-[-0.03em] text-ink-900">
            {project.name}
          </h1>
          {project.description && (
            <p className="mt-3 max-w-[70ch] whitespace-pre-line text-[15px] leading-relaxed text-ink-500">{project.description}</p>
          )}
        </div>
        <Button asChild className="h-10 shrink-0 rounded-lg">
          <Link href={`/portal/${context.organization.slug}/messages/${project.id}`}>
            <MessagesSquare aria-hidden className="size-4" />
            Message {context.organization.name}
            <UnreadBadge count={unreadMessages} />
          </Link>
        </Button>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Milestones" description="The steps to finishing this project." />
            <div className="px-5 pb-6 pt-5 sm:px-6">
              {milestones.length === 0 ? (
                <EmptyState
                  icon={<Flag />}
                  title="No milestones yet"
                  description={`${context.organization.name} will add the project's steps here.`}
                />
              ) : (
                <MilestoneTimeline milestones={milestones} today={today} />
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Files" description={`Files ${context.organization.name} has shared with you.`} />
            <div className="px-3 pb-4 pt-3 sm:px-4">
              {files.length === 0 ? (
                <EmptyState
                  icon={<FolderOpen />}
                  title="No files yet"
                  description={`Files ${context.organization.name} shares for this project will appear here.`}
                />
              ) : (
                <PortalFileList slug={context.organization.slug} files={files} />
              )}
            </div>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card className="p-5 sm:p-6">
            <p className="text-[13px] font-medium text-ink-500">Progress</p>
            <p className="mt-1 font-display text-[32px] font-bold leading-none tracking-[-0.03em] text-ink-900 tabular-nums">
              {project.progress}%
            </p>
            <ProjectProgress value={project.progress} label="Project progress" className="mt-4" />
            <p className="mt-2 text-[13px] text-ink-500">
              {project.milestonesCompleted} of {project.milestoneTotal} milestones complete
            </p>
          </Card>

          {dates.length > 0 && (
            <Card className="p-5 sm:p-6">
              <ul className="space-y-4">
                {dates.map((date) => (
                  <li key={date.label} className="flex items-center gap-3">
                    <IconTile icon={date.icon} tone={date.tone} />
                    <div>
                      <p className="text-[12.5px] text-ink-500">{date.label}</p>
                      <p className="text-[14px] font-semibold text-ink-900">{formatDate(date.value)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
