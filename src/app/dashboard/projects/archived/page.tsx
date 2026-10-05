import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArchivedRecordsSection } from "@/components/shared/ArchivedRecordsSection";
import { ArchivedRowActions } from "@/components/shared/ArchivedRowActions";
import { BackLink } from "@/components/shared/BackLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchForm } from "@/components/shared/SearchForm";
import { deleteProjectAction, restoreProjectAction } from "@/server/actions/projects";
import { requireOrganizationContext } from "@/server/auth/organization";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { listArchivedProjects } from "@/server/repositories/project.repository";
import { archivedListQuerySchema } from "@/validators/fields";

export const metadata: Metadata = {
  title: "Archived projects",
};

const pathname = "/dashboard/projects/archived";

export default async function ArchivedProjectsPage(props: PageProps<"/dashboard/projects/archived">) {
  const { organization, membership } = await requireOrganizationContext();

  if (!hasPermission(membership.role, permissions.projectsDelete)) {
    notFound();
  }

  const query = archivedListQuerySchema.parse(await props.searchParams);
  const result = await listArchivedProjects(organization.id, query);

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <BackLink href="/dashboard/projects">Projects</BackLink>
      <div className="mt-4">
        <PageHeader
          title="Archived projects"
          description="Restore a project to bring it and its milestones back, or delete it permanently."
        />
      </div>

      <div className="mt-8 space-y-5">
        <SearchForm action={pathname} label="Search archived projects" placeholder="Search project or client" defaultValue={query.q} />

        <ArchivedRecordsSection
          result={result}
          query={query}
          pathname={pathname}
          recordLabel="Project"
          pluralLabel="projects"
          renderActions={(project) => (
            <ArchivedRowActions
              name={project.name}
              permanentDescription="This project, its milestones, and its activity history will be erased from the database. This can't be undone."
              onRestore={restoreProjectAction.bind(null, project.id)}
              onDeletePermanently={deleteProjectAction.bind(null, project.id, "permanent")}
            />
          )}
        />
      </div>
    </div>
  );
}
