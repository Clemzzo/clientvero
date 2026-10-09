import "server-only";

import { randomUUID } from "node:crypto";

import { and, eq, isNotNull, isNull, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { activityLogs, clients, files, messages, milestones, projects, type Project, type ProjectStatus } from "@/db/schema";
import { activityActions, activityResources, type ActivityAction } from "@/features/activity/activity-actions";
import { projectProgress } from "@/features/projects/progress";
import type { WorkspaceActor } from "@/server/auth/organization";
import { ConflictError, NotFoundError, ValidationError } from "@/server/errors";
import { activityInsert, activityInsertIf } from "@/server/services/activity.service";
import { getClient } from "@/server/services/client.service";
import { getProposal } from "@/server/services/proposal.service";
import type { CreateProjectInput, ProjectFormInput } from "@/validators/projects";

export type ProjectDetail = Project & {
  clientName: string;
  milestoneTotal: number;
  milestonesCompleted: number;
  progress: number;
};

const projectMissing = "This project no longer exists.";
const proposalHasProject = "This proposal already has a project. Open it from the proposal page.";

function ownedProjectScope(organizationId: string, projectId: string) {
  return and(eq(projects.id, projectId), eq(projects.organizationId, organizationId));
}

function projectScope(organizationId: string, projectId: string) {
  return and(ownedProjectScope(organizationId, projectId), isNull(projects.deletedAt));
}

function archivedProjectScope(organizationId: string, projectId: string) {
  return and(ownedProjectScope(organizationId, projectId), isNotNull(projects.deletedAt));
}

const liveProjectForProposal = sql`${projects.proposalId} is not null and ${projects.deletedAt} is null`;

export function projectActivity(
  ctx: WorkspaceActor,
  projectId: string,
  action: ActivityAction,
  metadata: Record<string, unknown>,
) {
  return activityInsert({
    organizationId: ctx.organization.id,
    actorUserId: ctx.user.id,
    action,
    resourceType: activityResources.project,
    resourceId: projectId,
    metadata,
  });
}

async function findProject(where: SQL | undefined): Promise<Project> {
  const [project] = await db.select().from(projects).where(where).limit(1);

  if (!project) {
    throw new NotFoundError(projectMissing);
  }

  return project;
}

export function requireProject(organizationId: string, projectId: string): Promise<Project> {
  return findProject(projectScope(organizationId, projectId));
}

export async function getProject(organizationId: string, projectId: string): Promise<ProjectDetail> {
  const [row] = await db
    .select({
      project: projects,
      clientName: clients.name,
      milestoneTotal: sql<number>`(select count(*) from ${milestones} where ${milestones.projectId} = ${projects.id})`.mapWith(Number),
      milestonesCompleted: sql<number>`(select count(*) from ${milestones} where ${milestones.projectId} = ${projects.id} and ${milestones.status} = 'COMPLETED')`.mapWith(Number),
    })
    .from(projects)
    .innerJoin(clients, eq(clients.id, projects.clientId))
    .where(projectScope(organizationId, projectId))
    .limit(1);

  if (!row) {
    throw new NotFoundError(projectMissing);
  }

  return {
    ...row.project,
    clientName: row.clientName,
    milestoneTotal: row.milestoneTotal,
    milestonesCompleted: row.milestonesCompleted,
    progress: projectProgress(row.milestonesCompleted, row.milestoneTotal, row.project.status),
  };
}

function projectValues(input: ProjectFormInput) {
  return {
    name: input.name,
    description: input.description,
    budget: input.budget,
    currency: input.currency,
    startDate: input.startDate,
    dueDate: input.dueDate,
  };
}

async function resolveClientId(organizationId: string, input: CreateProjectInput): Promise<string> {
  if (!input.proposalId) {
    return input.clientId;
  }

  const proposal = await getProposal(organizationId, input.proposalId);

  if (proposal.status !== "ACCEPTED") {
    throw new ValidationError("Only accepted proposals can become projects.");
  }

  return proposal.clientId;
}

export async function createProject(ctx: WorkspaceActor, input: CreateProjectInput): Promise<string> {
  const organizationId = ctx.organization.id;
  const clientId = await resolveClientId(organizationId, input);
  await getClient(organizationId, clientId);
  const projectId = randomUUID();

  const [created] = await db.batch([
    db
      .insert(projects)
      .values({
        ...projectValues(input),
        id: projectId,
        organizationId,
        clientId,
        proposalId: input.proposalId,
        createdBy: ctx.user.id,
      })
      .onConflictDoNothing({ target: projects.proposalId, where: liveProjectForProposal })
      .returning({ id: projects.id }),
    activityInsertIf(
      {
        organizationId,
        actorUserId: ctx.user.id,
        action: activityActions.projectCreated,
        resourceType: activityResources.project,
        resourceId: projectId,
        metadata: { name: input.name },
      },
      sql`exists (select 1 from ${projects} where ${projects.id} = ${projectId})`,
    ),
  ]);

  if (created.length === 0) {
    throw new ConflictError(proposalHasProject);
  }

  return projectId;
}

export async function updateProject(ctx: WorkspaceActor, projectId: string, input: ProjectFormInput): Promise<void> {
  await requireProject(ctx.organization.id, projectId);

  await db.batch([
    db.update(projects).set(projectValues(input)).where(projectScope(ctx.organization.id, projectId)),
    projectActivity(ctx, projectId, activityActions.projectUpdated, { name: input.name }),
  ]);
}

export async function changeProjectStatus(ctx: WorkspaceActor, projectId: string, status: ProjectStatus): Promise<void> {
  const project = await requireProject(ctx.organization.id, projectId);

  if (project.status === status) {
    return;
  }

  await db.batch([
    db
      .update(projects)
      .set({ status, completedAt: status === "COMPLETED" ? new Date() : null })
      .where(projectScope(ctx.organization.id, projectId)),
    projectActivity(ctx, projectId, activityActions.projectStatusChanged, { name: project.name, projectStatus: status }),
  ]);
}

export async function archiveProject(ctx: WorkspaceActor, projectId: string): Promise<void> {
  const project = await requireProject(ctx.organization.id, projectId);

  await db.batch([
    db.update(projects).set({ deletedAt: new Date() }).where(projectScope(ctx.organization.id, projectId)),
    projectActivity(ctx, projectId, activityActions.projectDeleted, { name: project.name }),
  ]);
}

const proposalAlreadyHasProject =
  "The proposal this project came from already has another project. Archive or delete that one first.";

export async function restoreProject(ctx: WorkspaceActor, projectId: string): Promise<void> {
  const organizationId = ctx.organization.id;
  const project = await findProject(archivedProjectScope(organizationId, projectId));
  const proposalIsFree = project.proposalId
    ? sql`not exists (
        select 1 from ${projects}
        where ${projects.proposalId} = ${project.proposalId}
          and ${projects.deletedAt} is null
          and ${projects.id} <> ${projectId}
      )`
    : undefined;

  const [restored] = await db.batch([
    db
      .update(projects)
      .set({ deletedAt: null })
      .where(and(archivedProjectScope(organizationId, projectId), proposalIsFree))
      .returning({ id: projects.id }),
    activityInsertIf(
      {
        organizationId,
        actorUserId: ctx.user.id,
        action: activityActions.projectRestored,
        resourceType: activityResources.project,
        resourceId: projectId,
        metadata: { name: project.name },
      },
      sql`exists (select 1 from ${projects} where ${projects.id} = ${projectId} and ${projects.deletedAt} is null)`,
    ),
  ]);

  if (restored.length === 0) {
    throw new ConflictError(proposalAlreadyHasProject);
  }
}

const projectHasHistory = "This project has files or messages, so it can only be archived.";

export async function deleteProjectPermanently(ctx: WorkspaceActor, projectId: string): Promise<void> {
  const organizationId = ctx.organization.id;
  const project = await findProject(ownedProjectScope(organizationId, projectId));

  const [projectFile, projectMessage] = await Promise.all([
    db
      .select({ id: files.id })
      .from(files)
      .where(and(eq(files.organizationId, organizationId), eq(files.projectId, projectId)))
      .limit(1),
    db
      .select({ id: messages.id })
      .from(messages)
      .where(and(eq(messages.organizationId, organizationId), eq(messages.projectId, projectId)))
      .limit(1),
  ]);

  if (projectFile.length > 0 || projectMessage.length > 0) {
    throw new ConflictError(projectHasHistory);
  }

  await db.batch([
    db.delete(projects).where(ownedProjectScope(organizationId, projectId)),
    db
      .delete(activityLogs)
      .where(
        and(
          eq(activityLogs.organizationId, organizationId),
          eq(activityLogs.resourceType, activityResources.project),
          eq(activityLogs.resourceId, projectId),
        ),
      ),
    projectActivity(ctx, projectId, activityActions.projectDeletedPermanently, { name: project.name }),
  ]);
}
