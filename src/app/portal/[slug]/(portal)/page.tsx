import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PortalProjectGrid } from "@/components/portal/PortalProjectGrid";
import { PortalSummary } from "@/components/portal/PortalSummary";
import { PageHeader } from "@/components/shared/PageHeader";
import { activeProjectStatuses } from "@/features/projects/project-status";
import { formatDate } from "@/lib/utils/format";
import { requirePortalContext } from "@/server/auth/portal-session";
import { listPortalProjects, type PortalProjectSummary } from "@/server/repositories/portal.repository";

export const metadata: Metadata = {
  title: "Overview",
};

const OVERVIEW_PROJECT_LIMIT = 4;

function isActive(project: PortalProjectSummary) {
  return (activeProjectStatuses as readonly string[]).includes(project.status);
}

function nextDue(projects: PortalProjectSummary[]) {
  const upcoming = projects
    .flatMap((project) => (project.nextMilestone?.dueDate ? [{ ...project.nextMilestone, dueDate: project.nextMilestone.dueDate }] : []))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  return upcoming ? { label: formatDate(upcoming.dueDate), detail: upcoming.name } : null;
}

export default async function PortalOverviewPage(props: PageProps<"/portal/[slug]">) {
  const context = await requirePortalContext((await props.params).slug);
  const projects = await listPortalProjects(context);
  const active = projects.filter(isActive);
  const featured = (active.length > 0 ? active : projects).slice(0, OVERVIEW_PROJECT_LIMIT);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${context.client.name}`}
        description={`Here's where your work with ${context.organization.name} stands.`}
      />

      <PortalSummary
        activeProjects={active.length}
        milestonesCompleted={projects.reduce((sum, project) => sum + project.milestonesCompleted, 0)}
        milestoneTotal={projects.reduce((sum, project) => sum + project.milestoneTotal, 0)}
        nextDue={nextDue(projects)}
      />

      <section aria-labelledby="portal-projects" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id="portal-projects" className="text-[17px] font-semibold text-ink-900">
            {active.length > 0 ? "Active projects" : "Your projects"}
          </h2>
          {projects.length > featured.length && (
            <Link
              href={`/portal/${context.organization.slug}/projects`}
              className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-brand-700 hover:underline"
            >
              View all projects
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          )}
        </div>
        <PortalProjectGrid slug={context.organization.slug} organizationName={context.organization.name} projects={featured} />
      </section>
    </div>
  );
}
