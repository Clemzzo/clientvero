import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InboxPane } from "@/components/messages/InboxPane";
import { TeamThread } from "@/components/messages/TeamThread";
import { ThreadContextPanel } from "@/components/messages/ThreadContextPanel";
import { ThreadHeader } from "@/components/messages/ThreadHeader";
import { requireOrganizationContext } from "@/server/auth/organization";
import { permissions, requirePermission } from "@/server/authorization/permissions";
import { NotFoundError } from "@/server/errors";
import { listMilestones } from "@/server/services/milestone.service";
import { getProject } from "@/server/services/project.service";
import { projectIdSchema } from "@/validators/projects";

import { loadInbox } from "../inbox-data";

const loadThreadProject = cache(async (id: string) => {
  const projectId = projectIdSchema.safeParse(id);
  if (!projectId.success) notFound();

  const ctx = await requireOrganizationContext();
  requirePermission(ctx, permissions.projectsRead);

  try {
    const [project, milestones] = await Promise.all([
      getProject(ctx.organization.id, projectId.data),
      listMilestones(ctx.organization.id, projectId.data),
    ]);
    return { ctx, project, milestones };
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
});

export async function generateMetadata(props: PageProps<"/dashboard/messages/[projectId]">): Promise<Metadata> {
  const { project } = await loadThreadProject((await props.params).projectId);
  return { title: `Messages: ${project.name}` };
}

export default async function ThreadPage(props: PageProps<"/dashboard/messages/[projectId]">) {
  const [{ ctx, project, milestones }, { query, result, projects }] = await Promise.all([
    loadThreadProject((await props.params).projectId),
    loadInbox(await props.searchParams),
  ]);
  const next = milestones.find((milestone) => milestone.status !== "COMPLETED");

  return (
    <div className="flex h-[calc(100dvh-101px)] lg:h-[calc(100dvh-64px)]">
      <InboxPane
        result={result}
        query={query}
        projects={projects}
        activeProjectId={project.id}
        className="hidden w-[360px] border-r border-ink-200 lg:flex"
      />
      <div className="flex min-w-0 flex-1 flex-col bg-ink-50">
        <ThreadHeader
          projectName={project.name}
          subtitle={project.clientName}
          status={project.status}
          progress={project.progress}
          backHref="/dashboard/messages"
          backLabel="Messages"
        />
        <TeamThread
          key={project.id}
          organizationId={ctx.organization.id}
          user={ctx.user}
          projectId={project.id}
          clientId={project.clientId}
          clientName={project.clientName}
        />
      </div>
      <ThreadContextPanel
        projectHref={`/dashboard/projects/${project.id}`}
        milestonesCompleted={project.milestonesCompleted}
        milestoneTotal={project.milestoneTotal}
        nextMilestone={next ? { name: next.name, dueDate: next.dueDate } : null}
      />
    </div>
  );
}
