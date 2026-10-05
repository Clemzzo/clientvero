import "server-only";

import { cache } from "react";
import { notFound } from "next/navigation";

import { requireOrganizationContext } from "@/server/auth/organization";
import { NotFoundError } from "@/server/errors";
import { getProject } from "@/server/services/project.service";
import { projectIdSchema } from "@/validators/projects";

export const loadProject = cache(async (id: string) => {
  const projectId = projectIdSchema.safeParse(id);

  if (!projectId.success) {
    notFound();
  }

  const ctx = await requireOrganizationContext();

  try {
    return { ctx, project: await getProject(ctx.organization.id, projectId.data) };
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
});
