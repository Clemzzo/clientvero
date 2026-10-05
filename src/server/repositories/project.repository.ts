import "server-only";

import { and, count, desc, eq, ilike, inArray, isNotNull, isNull, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { clients, milestones, projects, type ProjectStatus } from "@/db/schema";
import {
  activeProjectStatuses,
  projectFilterStatuses,
  projectFilters,
  type ProjectFilter,
} from "@/features/projects/project-status";
import { projectProgress } from "@/features/projects/progress";
import { escapeLike } from "@/server/repositories/search";
import type { ArchivedListResult } from "@/types/archived-record";
import type { ArchivedListQuery } from "@/validators/fields";
import { PROJECTS_PAGE_SIZE, type ProjectListQuery } from "@/validators/projects";

export type ProjectListRow = {
  id: string;
  name: string;
  status: ProjectStatus;
  currency: string;
  budget: string | null;
  dueDate: string | null;
  createdAt: Date;
  clientId: string;
  clientName: string;
  milestoneTotal: number;
  milestonesCompleted: number;
  progress: number;
};

export type ProjectListResult = {
  rows: ProjectListRow[];
  total: number;
  pageCount: number;
  counts: Record<ProjectFilter, number>;
};

function visibleProjects(organizationId: string) {
  return [eq(projects.organizationId, organizationId), isNull(projects.deletedAt)];
}

function searchFilter(q: string) {
  const pattern = `%${escapeLike(q)}%`;
  return or(ilike(projects.name, pattern), ilike(clients.name, pattern))!;
}

function milestoneCounts(organizationId: string) {
  return db
    .select({
      projectId: milestones.projectId,
      total: count().as("milestone_total"),
      completed: sql<number>`count(*) filter (where ${milestones.status} = 'COMPLETED')`.as("milestone_completed"),
    })
    .from(milestones)
    .where(eq(milestones.organizationId, organizationId))
    .groupBy(milestones.projectId)
    .as("milestone_counts");
}

function selectProjectRows(organizationId: string, where: SQL | undefined) {
  const counts = milestoneCounts(organizationId);

  return db
    .select({
      id: projects.id,
      name: projects.name,
      status: projects.status,
      currency: projects.currency,
      budget: projects.budget,
      dueDate: projects.dueDate,
      createdAt: projects.createdAt,
      clientId: projects.clientId,
      clientName: clients.name,
      milestoneTotal: sql<number>`coalesce(${counts.total}, 0)`.mapWith(Number),
      milestonesCompleted: sql<number>`coalesce(${counts.completed}, 0)`.mapWith(Number),
    })
    .from(projects)
    .innerJoin(clients, eq(clients.id, projects.clientId))
    .leftJoin(counts, eq(counts.projectId, projects.id))
    .where(where)
    .orderBy(desc(projects.createdAt), desc(projects.id))
    .$dynamic();
}

function withProgress(rows: Omit<ProjectListRow, "progress">[]): ProjectListRow[] {
  return rows.map((row) => ({
    ...row,
    progress: projectProgress(row.milestonesCompleted, row.milestoneTotal, row.status),
  }));
}

async function countByFilter(organizationId: string, q: string): Promise<Record<ProjectFilter, number>> {
  const filters: SQL[] = visibleProjects(organizationId);
  if (q) filters.push(searchFilter(q));

  const rows = await db
    .select({ status: projects.status, total: count() })
    .from(projects)
    .innerJoin(clients, eq(clients.id, projects.clientId))
    .where(and(...filters))
    .groupBy(projects.status);

  const counts = Object.fromEntries(projectFilters.map((filter) => [filter, 0])) as Record<ProjectFilter, number>;

  for (const row of rows) {
    counts.all += row.total;
    for (const [filter, statuses] of Object.entries(projectFilterStatuses)) {
      if (statuses.includes(row.status)) counts[filter as ProjectFilter] += row.total;
    }
  }

  return counts;
}

export async function listProjects(organizationId: string, query: ProjectListQuery): Promise<ProjectListResult> {
  const filters: SQL[] = visibleProjects(organizationId);
  if (query.q) filters.push(searchFilter(query.q));
  if (query.status !== "all") filters.push(inArray(projects.status, [...projectFilterStatuses[query.status]]));

  const [rows, counts] = await Promise.all([
    selectProjectRows(organizationId, and(...filters))
      .limit(PROJECTS_PAGE_SIZE)
      .offset((query.page - 1) * PROJECTS_PAGE_SIZE),
    countByFilter(organizationId, query.q),
  ]);

  const total = counts[query.status];
  return { rows: withProgress(rows), total, pageCount: Math.max(1, Math.ceil(total / PROJECTS_PAGE_SIZE)), counts };
}

export async function listClientProjects(organizationId: string, clientId: string): Promise<ProjectListRow[]> {
  const rows = await selectProjectRows(
    organizationId,
    and(...visibleProjects(organizationId), eq(projects.clientId, clientId)),
  ).limit(50);

  return withProgress(rows);
}

export async function findProjectIdForProposal(organizationId: string, proposalId: string): Promise<string | null> {
  const [row] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(...visibleProjects(organizationId), eq(projects.proposalId, proposalId)))
    .limit(1);

  return row?.id ?? null;
}

export async function countActiveProjects(organizationId: string): Promise<{ active: number; total: number }> {
  const [row] = await db
    .select({
      active: sql<number>`count(*) filter (where ${inArray(projects.status, [...activeProjectStatuses])})`.mapWith(Number),
      total: count(),
    })
    .from(projects)
    .where(and(...visibleProjects(organizationId)));

  return row;
}

export async function listArchivedProjects(organizationId: string, query: ArchivedListQuery): Promise<ArchivedListResult> {
  const filters: SQL[] = [eq(projects.organizationId, organizationId), isNotNull(projects.deletedAt)];
  if (query.q) filters.push(searchFilter(query.q));
  const where = and(...filters);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: projects.id,
        name: projects.name,
        detail: clients.name,
        archivedAt: sql<Date>`${projects.deletedAt}`.mapWith(projects.deletedAt),
      })
      .from(projects)
      .innerJoin(clients, eq(clients.id, projects.clientId))
      .where(where)
      .orderBy(desc(projects.deletedAt), desc(projects.id))
      .limit(PROJECTS_PAGE_SIZE)
      .offset((query.page - 1) * PROJECTS_PAGE_SIZE),
    db.select({ total: count() }).from(projects).innerJoin(clients, eq(clients.id, projects.clientId)).where(where),
  ]);

  return { rows, total, pageCount: Math.max(1, Math.ceil(total / PROJECTS_PAGE_SIZE)) };
}
