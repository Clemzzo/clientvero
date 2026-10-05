import type { Metadata } from "next";
import Link from "next/link";
import { Activity, Settings } from "lucide-react";

import { MilestonesCard } from "@/components/projects/MilestonesCard";
import { ProjectDetails } from "@/components/projects/ProjectDetails";
import { ProjectStatusMenu } from "@/components/projects/ProjectStatusMenu";
import { ActivityTimeline } from "@/components/shared/ActivityTimeline";
import { BackLink } from "@/components/shared/BackLink";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TabLinks } from "@/components/shared/TabLinks";
import { UrlNotice } from "@/components/shared/UrlNotice";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { activityResources } from "@/features/activity/activity-actions";
import { noticeSchema } from "@/features/notices";
import { projectStatusLabels, projectStatusTones } from "@/features/projects/project-status";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { listActivity } from "@/server/services/activity.service";
import { listMilestones } from "@/server/services/milestone.service";
import { projectTabSchema, type ProjectTab } from "@/validators/projects";

import { loadProject } from "./load-project";

export async function generateMetadata(props: PageProps<"/dashboard/projects/[id]">): Promise<Metadata> {
  const { project } = await loadProject((await props.params).id);
  return { title: project.name };
}

export default async function ProjectPage(props: PageProps<"/dashboard/projects/[id]">) {
  const { ctx, project } = await loadProject((await props.params).id);
  const searchParams = await props.searchParams;
  const tab = projectTabSchema.parse(searchParams.tab);
  const notice = noticeSchema.parse(searchParams.notice);
  const canEdit = hasPermission(ctx.membership.role, permissions.projectsUpdate);
  const milestones = await listMilestones(ctx.organization.id, project.id);
  const basePath = `/dashboard/projects/${project.id}`;

  const tabs: { value: ProjectTab; label: string; href: string; count?: number }[] = [
    { value: "overview", label: "Overview", href: basePath },
    { value: "milestones", label: "Milestones", href: `${basePath}?tab=milestones`, count: milestones.length },
    { value: "activity", label: "Activity", href: `${basePath}?tab=activity` },
  ];

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <UrlNotice
        notice={notice}
        message={notice === "project-created" ? `${project.name} was created.` : "Your changes were saved."}
      />
      <BackLink href="/dashboard/projects">Projects</BackLink>

      <header className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-[clamp(24px,2.2vw,30px)] font-extrabold leading-[1.15] tracking-[-0.03em] text-ink-900">
              {project.name}
            </h1>
            <StatusBadge label={projectStatusLabels[project.status]} tone={projectStatusTones[project.status]} />
          </div>
          <p className="mt-1.5 text-[15px] text-ink-500">
            For{" "}
            <Link href={`/dashboard/clients/${project.clientId}`} className="font-medium text-ink-700 hover:text-brand-700">
              {project.clientName}
            </Link>
          </p>
        </div>

        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <ProjectStatusMenu projectId={project.id} projectName={project.name} status={project.status} />
            <Button asChild variant="outline" className="h-10 rounded-lg">
              <Link href={`${basePath}/settings`}>
                <Settings aria-hidden className="size-4" />
                Settings
              </Link>
            </Button>
          </div>
        )}
      </header>

      <div className="mt-6">
        <TabLinks label="Project sections" tabs={tabs} active={tab} />
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <ProjectDetails project={project} />
            <MilestonesCard projectId={project.id} milestones={milestones} canEdit={canEdit} />
          </div>
        )}
        {tab === "milestones" && <MilestonesCard projectId={project.id} milestones={milestones} canEdit={canEdit} />}
        {tab === "activity" && <ProjectActivity organizationId={ctx.organization.id} projectId={project.id} />}
      </div>
    </div>
  );
}

async function ProjectActivity({ organizationId, projectId }: { organizationId: string; projectId: string }) {
  const entries = await listActivity(organizationId, activityResources.project, projectId);

  return (
    <Card>
      <CardHeader title="Activity" description="Everything that's happened on this project." />
      {entries.length === 0 ? (
        <EmptyState icon={<Activity />} title="No activity yet" description="Changes to this project will show up here." />
      ) : (
        <div className="mt-2 px-5 pb-3 sm:px-6">
          <ActivityTimeline entries={entries} showSubject={false} />
        </div>
      )}
    </Card>
  );
}
