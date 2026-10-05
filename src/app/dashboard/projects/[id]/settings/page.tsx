import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectForm } from "@/components/projects/ProjectForm";
import { BackLink } from "@/components/shared/BackLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { existingProjectValues } from "@/features/projects/project-form-values";
import { updateProjectAction } from "@/server/actions/projects";
import { hasPermission, permissions } from "@/server/authorization/permissions";

import { loadProject } from "../load-project";

export async function generateMetadata(props: PageProps<"/dashboard/projects/[id]/settings">): Promise<Metadata> {
  const { project } = await loadProject((await props.params).id);
  return { title: `Settings · ${project.name}` };
}

export default async function ProjectSettingsPage(props: PageProps<"/dashboard/projects/[id]/settings">) {
  const { ctx, project } = await loadProject((await props.params).id);

  if (!hasPermission(ctx.membership.role, permissions.projectsUpdate)) {
    notFound();
  }

  const projectPath = `/dashboard/projects/${project.id}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 lg:py-10">
      <BackLink href={projectPath}>{project.name}</BackLink>
      <div className="mt-4">
        <PageHeader title="Project settings" description="Update the project's details. The client can't be changed." />
      </div>
      <div className="mt-8">
        <ProjectForm
          action={updateProjectAction.bind(null, project.id)}
          values={existingProjectValues(project)}
          client={{ kind: "fixed", name: project.clientName, hint: "Set when the project was created." }}
          cancelHref={projectPath}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
