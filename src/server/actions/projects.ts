"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { workspaceLimits } from "@/lib/redis/rate-limit";
import { readFormFields } from "@/lib/utils/form-data";
import { toActionError } from "@/server/actions/action-error";
import { requireWithinLimit } from "@/server/actions/rate-limit-guard";
import { requireOrganizationContext } from "@/server/auth/organization";
import { permissions, requirePermission, type Permission } from "@/server/authorization/permissions";
import {
  addMilestone,
  changeMilestoneStatus,
  deleteMilestone,
  moveMilestone,
  updateMilestone,
} from "@/server/services/milestone.service";
import {
  archiveProject,
  changeProjectStatus,
  createProject,
  deleteProjectPermanently,
  restoreProject,
  updateProject,
} from "@/server/services/project.service";
import type { FormState } from "@/types/form-state";
import { deletionModeSchema } from "@/validators/fields";
import {
  createProjectSchema,
  milestoneFormSchema,
  milestoneIdSchema,
  milestoneStatusSchema,
  moveDirectionSchema,
  projectFormSchema,
  projectIdSchema,
  projectStatusSchema,
} from "@/validators/projects";

const projectFields = ["name", "description", "budget", "currency", "startDate", "dueDate"] as const;
const newProjectFields = [...projectFields, "clientId", "proposalId"] as const;
const milestoneFields = ["name", "description", "dueDate"] as const;

const invalidForm = "Check the highlighted fields and try again.";
const projectMissing = "This project no longer exists.";
const milestoneMissing = "This milestone no longer exists.";
const errorOptions = { scope: "projects", notFound: projectMissing };

export type MilestoneFormState = FormState | { success: true };

type MilestoneIds = { projectId: string; milestoneId: string };

async function requireProjectWriter(permission: Permission) {
  const ctx = await requireOrganizationContext();
  requirePermission(ctx, permission);
  await requireWithinLimit(ctx, workspaceLimits.writesPerUser);
  return ctx;
}

function revalidateProjects() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects", "layout");
  revalidatePath("/dashboard/clients", "layout");
  revalidatePath("/dashboard/proposals", "layout");
}

function parseMilestoneIds(ids: MilestoneIds) {
  const projectId = projectIdSchema.safeParse(ids.projectId);
  const milestoneId = milestoneIdSchema.safeParse(ids.milestoneId);
  return projectId.success && milestoneId.success ? { projectId: projectId.data, milestoneId: milestoneId.data } : null;
}

export async function createProjectAction(_previous: FormState, formData: FormData): Promise<FormState> {
  let projectId: string;

  try {
    const ctx = await requireProjectWriter(permissions.projectsCreate);

    const parsed = createProjectSchema.safeParse(readFormFields(formData, newProjectFields));
    if (!parsed.success) {
      return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }

    projectId = await createProject(ctx, parsed.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateProjects();
  redirect(`/dashboard/projects/${projectId}?notice=project-created`);
}

export async function updateProjectAction(id: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const projectId = projectIdSchema.safeParse(id);

  if (!projectId.success) {
    return { error: projectMissing };
  }

  try {
    const ctx = await requireProjectWriter(permissions.projectsUpdate);

    const parsed = projectFormSchema.safeParse(readFormFields(formData, projectFields));
    if (!parsed.success) {
      return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }

    await updateProject(ctx, projectId.data, parsed.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateProjects();
  redirect(`/dashboard/projects/${projectId.data}?notice=project-saved`);
}

export async function changeProjectStatusAction(id: string, status: string): Promise<{ error?: string }> {
  const projectId = projectIdSchema.safeParse(id);
  const nextStatus = projectStatusSchema.safeParse(status);

  if (!projectId.success || !nextStatus.success) {
    return { error: "That status change isn't valid." };
  }

  try {
    const ctx = await requireProjectWriter(permissions.projectsUpdate);
    await changeProjectStatus(ctx, projectId.data, nextStatus.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateProjects();
  return {};
}

export async function deleteProjectAction(id: string, mode: string): Promise<{ error?: string }> {
  const projectId = projectIdSchema.safeParse(id);
  const deletion = deletionModeSchema.safeParse(mode);

  if (!projectId.success) {
    return { error: projectMissing };
  }

  if (!deletion.success) {
    return { error: "That delete option isn't valid." };
  }

  try {
    const ctx = await requireProjectWriter(permissions.projectsDelete);

    if (deletion.data === "permanent") {
      await deleteProjectPermanently(ctx, projectId.data);
    } else {
      await archiveProject(ctx, projectId.data);
    }
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateProjects();
  return {};
}

export async function restoreProjectAction(id: string): Promise<{ error?: string }> {
  const projectId = projectIdSchema.safeParse(id);

  if (!projectId.success) {
    return { error: projectMissing };
  }

  try {
    const ctx = await requireProjectWriter(permissions.projectsDelete);
    await restoreProject(ctx, projectId.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateProjects();
  return {};
}

export async function saveMilestoneAction(
  ids: { projectId: string; milestoneId?: string },
  _previous: MilestoneFormState,
  formData: FormData,
): Promise<MilestoneFormState> {
  const projectId = projectIdSchema.safeParse(ids.projectId);
  const milestoneId = milestoneIdSchema.optional().safeParse(ids.milestoneId);

  if (!projectId.success || !milestoneId.success) {
    return { error: milestoneMissing };
  }

  try {
    const ctx = await requireProjectWriter(permissions.projectsUpdate);

    const parsed = milestoneFormSchema.safeParse(readFormFields(formData, milestoneFields));
    if (!parsed.success) {
      return { error: invalidForm, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }

    if (milestoneId.data) {
      await updateMilestone(ctx, projectId.data, milestoneId.data, parsed.data);
    } else {
      await addMilestone(ctx, projectId.data, parsed.data);
    }
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateProjects();
  return { success: true };
}

export async function changeMilestoneStatusAction(ids: MilestoneIds, status: string): Promise<{ error?: string }> {
  const parsedIds = parseMilestoneIds(ids);
  const nextStatus = milestoneStatusSchema.safeParse(status);

  if (!parsedIds || !nextStatus.success) {
    return { error: "That status change isn't valid." };
  }

  try {
    const ctx = await requireProjectWriter(permissions.projectsUpdate);
    await changeMilestoneStatus(ctx, parsedIds.projectId, parsedIds.milestoneId, nextStatus.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateProjects();
  return {};
}

export async function moveMilestoneAction(ids: MilestoneIds, direction: string): Promise<{ error?: string }> {
  const parsedIds = parseMilestoneIds(ids);
  const parsedDirection = moveDirectionSchema.safeParse(direction);

  if (!parsedIds || !parsedDirection.success) {
    return { error: milestoneMissing };
  }

  try {
    const ctx = await requireProjectWriter(permissions.projectsUpdate);
    await moveMilestone(ctx, parsedIds.projectId, parsedIds.milestoneId, parsedDirection.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateProjects();
  return {};
}

export async function deleteMilestoneAction(ids: MilestoneIds): Promise<{ error?: string }> {
  const parsedIds = parseMilestoneIds(ids);

  if (!parsedIds) {
    return { error: milestoneMissing };
  }

  try {
    const ctx = await requireProjectWriter(permissions.projectsUpdate);
    await deleteMilestone(ctx, parsedIds.projectId, parsedIds.milestoneId);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidateProjects();
  return {};
}
