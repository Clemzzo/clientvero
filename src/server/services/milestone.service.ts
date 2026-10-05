import "server-only";

import { and, asc, count, eq, max } from "drizzle-orm";

import { db } from "@/db";
import { milestones, type Milestone, type MilestoneStatus, type Project } from "@/db/schema";
import { activityActions, type ActivityAction } from "@/features/activity/activity-actions";
import { MAX_MILESTONES } from "@/features/projects/milestone-status";
import type { WorkspaceActor } from "@/server/auth/organization";
import { NotFoundError, ValidationError } from "@/server/errors";
import { projectActivity, requireProject } from "@/server/services/project.service";
import type { MilestoneFormInput, MoveDirection } from "@/validators/projects";

function projectMilestones(organizationId: string, projectId: string) {
  return and(eq(milestones.organizationId, organizationId), eq(milestones.projectId, projectId));
}

function milestoneScope(organizationId: string, projectId: string, milestoneId: string) {
  return and(projectMilestones(organizationId, projectId), eq(milestones.id, milestoneId));
}

function milestoneActivity(ctx: WorkspaceActor, project: Project, action: ActivityAction, milestoneName: string) {
  return projectActivity(ctx, project.id, action, { name: project.name, milestoneName });
}

async function getMilestone(organizationId: string, projectId: string, milestoneId: string): Promise<Milestone> {
  const [milestone] = await db
    .select()
    .from(milestones)
    .where(milestoneScope(organizationId, projectId, milestoneId))
    .limit(1);

  if (!milestone) {
    throw new NotFoundError("This milestone no longer exists.");
  }

  return milestone;
}

export function listMilestones(organizationId: string, projectId: string): Promise<Milestone[]> {
  return db
    .select()
    .from(milestones)
    .where(projectMilestones(organizationId, projectId))
    .orderBy(asc(milestones.sortOrder), asc(milestones.createdAt));
}

export async function addMilestone(ctx: WorkspaceActor, projectId: string, input: MilestoneFormInput): Promise<void> {
  const organizationId = ctx.organization.id;
  const project = await requireProject(organizationId, projectId);

  const [{ total, lastSortOrder }] = await db
    .select({ total: count(), lastSortOrder: max(milestones.sortOrder) })
    .from(milestones)
    .where(projectMilestones(organizationId, projectId));

  if (total >= MAX_MILESTONES) {
    throw new ValidationError(`A project can have up to ${MAX_MILESTONES} milestones.`);
  }

  await db.batch([
    db.insert(milestones).values({
      ...input,
      organizationId,
      projectId,
      sortOrder: lastSortOrder === null ? 0 : lastSortOrder + 1,
    }),
    milestoneActivity(ctx, project, activityActions.milestoneAdded, input.name),
  ]);
}

export async function updateMilestone(
  ctx: WorkspaceActor,
  projectId: string,
  milestoneId: string,
  input: MilestoneFormInput,
): Promise<void> {
  const organizationId = ctx.organization.id;
  const project = await requireProject(organizationId, projectId);
  await getMilestone(organizationId, projectId, milestoneId);

  await db.batch([
    db.update(milestones).set(input).where(milestoneScope(organizationId, projectId, milestoneId)),
    milestoneActivity(ctx, project, activityActions.milestoneUpdated, input.name),
  ]);
}

export async function changeMilestoneStatus(
  ctx: WorkspaceActor,
  projectId: string,
  milestoneId: string,
  status: MilestoneStatus,
): Promise<void> {
  const organizationId = ctx.organization.id;
  const project = await requireProject(organizationId, projectId);
  const milestone = await getMilestone(organizationId, projectId, milestoneId);

  if (milestone.status === status) {
    return;
  }

  const completed = status === "COMPLETED";

  await db.batch([
    db
      .update(milestones)
      .set({ status, completedAt: completed ? new Date() : null })
      .where(milestoneScope(organizationId, projectId, milestoneId)),
    milestoneActivity(
      ctx,
      project,
      completed ? activityActions.milestoneCompleted : activityActions.milestoneUpdated,
      milestone.name,
    ),
  ]);
}

export async function deleteMilestone(ctx: WorkspaceActor, projectId: string, milestoneId: string): Promise<void> {
  const organizationId = ctx.organization.id;
  const project = await requireProject(organizationId, projectId);
  const milestone = await getMilestone(organizationId, projectId, milestoneId);

  await db.batch([
    db.delete(milestones).where(milestoneScope(organizationId, projectId, milestoneId)),
    milestoneActivity(ctx, project, activityActions.milestoneRemoved, milestone.name),
  ]);
}

export async function moveMilestone(
  ctx: WorkspaceActor,
  projectId: string,
  milestoneId: string,
  direction: MoveDirection,
): Promise<void> {
  const organizationId = ctx.organization.id;
  await requireProject(organizationId, projectId);
  const list = await listMilestones(organizationId, projectId);
  const index = list.findIndex((milestone) => milestone.id === milestoneId);

  if (index === -1) {
    throw new NotFoundError("This milestone no longer exists.");
  }

  const neighbour = list[direction === "up" ? index - 1 : index + 1];

  if (!neighbour) {
    return;
  }

  const current = list[index];

  await db.batch([
    db
      .update(milestones)
      .set({ sortOrder: neighbour.sortOrder })
      .where(milestoneScope(organizationId, projectId, current.id)),
    db
      .update(milestones)
      .set({ sortOrder: current.sortOrder })
      .where(milestoneScope(organizationId, projectId, neighbour.id)),
  ]);
}
