import "server-only";

import { and, asc, count, desc, eq, inArray, isNull, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import { milestones, projects, type MilestoneStatus, type ProjectStatus } from "@/db/schema";
import { projectProgress } from "@/features/projects/progress";
import type { PortalContext } from "@/server/auth/portal-session";
import { NotFoundError } from "@/server/errors";

export type PortalProject = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  dueDate: string | null;
  completedAt: Date | null;
  milestoneTotal: number;
  milestonesCompleted: number;
  progress: number;
};

export type PortalProjectSummary = PortalProject & {
  nextMilestone: { name: string; dueDate: string | null } | null;
};

export type PortalMilestone = {
  id: string;
  name: string;
  description: string | null;
  status: MilestoneStatus;
  dueDate: string | null;
  completedAt: Date | null;
};

const PORTAL_PROJECT_LIMIT = 50;

function clientProjects(context: PortalContext) {
  return and(
    eq(projects.organizationId, context.organization.id),
    eq(projects.clientId, context.client.id),
    isNull(projects.deletedAt),
  );
}

function milestoneCounts(context: PortalContext) {
  return db
    .select({
      projectId: milestones.projectId,
      total: count().as("milestone_total"),
      completed: sql<number>`count(*) filter (where ${milestones.status} = 'COMPLETED')`.as("milestone_completed"),
    })
    .from(milestones)
    .where(eq(milestones.organizationId, context.organization.id))
    .groupBy(milestones.projectId)
    .as("milestone_counts");
}

function selectPortalProjects(context: PortalContext) {
  const counts = milestoneCounts(context);

  return db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      startDate: projects.startDate,
      dueDate: projects.dueDate,
      completedAt: projects.completedAt,
      milestoneTotal: sql<number>`coalesce(${counts.total}, 0)`.mapWith(Number),
      milestonesCompleted: sql<number>`coalesce(${counts.completed}, 0)`.mapWith(Number),
    })
    .from(projects)
    .leftJoin(counts, eq(counts.projectId, projects.id))
    .$dynamic();
}

function withProgress<Row extends Omit<PortalProject, "progress">>(row: Row): Row & { progress: number } {
  return { ...row, progress: projectProgress(row.milestonesCompleted, row.milestoneTotal, row.status) };
}

export async function listPortalProjects(context: PortalContext): Promise<PortalProjectSummary[]> {
  const rows = await selectPortalProjects(context)
    .where(clientProjects(context))
    .orderBy(desc(projects.createdAt))
    .limit(PORTAL_PROJECT_LIMIT);

  if (rows.length === 0) {
    return [];
  }

  const nextMilestones = await db
    .selectDistinctOn([milestones.projectId], {
      projectId: milestones.projectId,
      name: milestones.name,
      dueDate: milestones.dueDate,
    })
    .from(milestones)
    .where(
      and(
        eq(milestones.organizationId, context.organization.id),
        inArray(
          milestones.projectId,
          rows.map((row) => row.id),
        ),
        ne(milestones.status, "COMPLETED"),
      ),
    )
    .orderBy(milestones.projectId, asc(milestones.sortOrder), asc(milestones.createdAt));

  const nextByProject = new Map(nextMilestones.map((milestone) => [milestone.projectId, milestone]));

  return rows.map((row) => {
    const next = nextByProject.get(row.id);
    return { ...withProgress(row), nextMilestone: next ? { name: next.name, dueDate: next.dueDate } : null };
  });
}

export async function getPortalProject(context: PortalContext, projectId: string): Promise<PortalProject> {
  const [row] = await selectPortalProjects(context)
    .where(and(clientProjects(context), eq(projects.id, projectId)))
    .limit(1);

  if (!row) {
    throw new NotFoundError("This project isn't available.");
  }

  return withProgress(row);
}

export function listPortalMilestones(context: PortalContext, projectId: string): Promise<PortalMilestone[]> {
  return db
    .select({
      id: milestones.id,
      name: milestones.name,
      description: milestones.description,
      status: milestones.status,
      dueDate: milestones.dueDate,
      completedAt: milestones.completedAt,
    })
    .from(milestones)
    .innerJoin(projects, eq(projects.id, milestones.projectId))
    .where(and(eq(milestones.projectId, projectId), eq(milestones.organizationId, context.organization.id), clientProjects(context)))
    .orderBy(asc(milestones.sortOrder), asc(milestones.createdAt));
}
