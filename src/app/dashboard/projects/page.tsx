import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban, Plus, SearchX } from "lucide-react";

import { ProjectsTable } from "@/components/projects/ProjectsTable";
import { ArchivedLinkButton } from "@/components/shared/ArchivedLinkButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchForm } from "@/components/shared/SearchForm";
import { TabLinks } from "@/components/shared/TabLinks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { projectFilters, type ProjectFilter } from "@/features/projects/project-status";
import { requireOrganizationContext } from "@/server/auth/organization";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { listProjects } from "@/server/repositories/project.repository";
import { projectListQuerySchema } from "@/validators/projects";

export const metadata: Metadata = {
  title: "Projects",
};

const filterLabels: Record<ProjectFilter, string> = {
  all: "All",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  cancelled: "Cancelled",
};

function filterHref(filter: ProjectFilter, q: string) {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("status", filter);
  if (q) params.set("q", q);
  const search = params.toString();
  return search ? `/dashboard/projects?${search}` : "/dashboard/projects";
}

function NewProjectButton({ label = "New project" }: { label?: string }) {
  return (
    <Button asChild className="rounded-lg">
      <Link href="/dashboard/projects/new">
        <Plus aria-hidden className="size-4" />
        {label}
      </Link>
    </Button>
  );
}

export default async function ProjectsPage(props: PageProps<"/dashboard/projects">) {
  const { organization, membership } = await requireOrganizationContext();
  const query = projectListQuerySchema.parse(await props.searchParams);
  const canCreate = hasPermission(membership.role, permissions.projectsCreate);
  const canDelete = hasPermission(membership.role, permissions.projectsDelete);
  const result = await listProjects(organization.id, query);
  const filtered = Boolean(query.q) || query.status !== "all";

  const tabs = projectFilters.map((filter) => ({
    value: filter,
    label: filterLabels[filter],
    href: filterHref(filter, query.q),
    count: result.counts[filter],
  }));

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <PageHeader
        title="Projects"
        description="Everything you're delivering, broken into milestones so you and your client can see progress."
        actions={
          (canDelete || canCreate) && (
            <>
              {canDelete && <ArchivedLinkButton href="/dashboard/projects/archived" />}
              {canCreate && <NewProjectButton />}
            </>
          )
        }
      />

      <div className="mt-8 space-y-5">
        <TabLinks label="Filter projects by status" tabs={tabs} active={query.status} />
        <SearchForm
          action="/dashboard/projects"
          label="Search projects"
          placeholder="Search project or client"
          defaultValue={query.q}
          hiddenFields={{ status: query.status === "all" ? undefined : query.status }}
        />

        {result.total === 0 ? (
          <Card>
            {filtered ? (
              <EmptyState
                icon={<SearchX />}
                title="No projects match"
                description="Try a different search or status."
                action={
                  <Button asChild variant="outline" className="rounded-lg">
                    <Link href="/dashboard/projects">Show all projects</Link>
                  </Button>
                }
                className="py-16"
              />
            ) : (
              <EmptyState
                icon={<FolderKanban />}
                title="No projects yet"
                description="Start a project for a client, or create one from an accepted proposal."
                action={canCreate && <NewProjectButton label="Start your first project" />}
                className="py-16"
              />
            )}
          </Card>
        ) : result.rows.length === 0 ? (
          <Card>
            <EmptyState
              icon={<SearchX />}
              title="This page is empty"
              description={`There are only ${result.pageCount} pages of projects.`}
              action={
                <Button asChild variant="outline" className="rounded-lg">
                  <Link href={filterHref(query.status, query.q)}>Go to the first page</Link>
                </Button>
              }
              className="py-16"
            />
          </Card>
        ) : (
          <>
            <ProjectsTable projects={result.rows} canDelete={canDelete} />
            <Pagination
              page={query.page}
              pageCount={result.pageCount}
              pathname="/dashboard/projects"
              searchParams={{ q: query.q, status: query.status === "all" ? undefined : query.status }}
            />
          </>
        )}
      </div>
    </div>
  );
}
