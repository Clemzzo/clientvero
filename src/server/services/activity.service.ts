import "server-only";

import { and, count, desc, eq, ne, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { activityLogs, users } from "@/db/schema";
import {
  activityActions,
  activityResources,
  type ActivityAction,
  type ActivityActorType,
  type ActivityResource,
} from "@/features/activity/activity-actions";
import { activityFilterResources } from "@/features/activity/activity-filters";
import type { WorkspaceActor } from "@/server/auth/organization";
import { NotFoundError, ValidationError } from "@/server/errors";
import { ACTIVITY_PAGE_SIZE, type ActivityListQuery } from "@/validators/activity";

type ActivityInput = {
  organizationId: string;
  actorUserId: string | null;
  actorType?: ActivityActorType;
  action: ActivityAction;
  resourceType: ActivityResource;
  resourceId: string;
  metadata?: Record<string, unknown>;
};

export function activityInsert(input: ActivityInput) {
  return db.insert(activityLogs).values(input);
}

export function activityInsertIf(input: ActivityInput, condition: SQL) {
  return db.execute(sql`
    insert into ${activityLogs} (organization_id, actor_user_id, actor_type, action, resource_type, resource_id, metadata)
    select ${input.organizationId}, ${input.actorUserId}, ${input.actorType ?? "USER"}, ${input.action},
      ${input.resourceType}, ${input.resourceId}, ${JSON.stringify(input.metadata ?? {})}::jsonb
    where ${condition}
  `);
}

const activityFields = {
  id: activityLogs.id,
  action: activityLogs.action,
  resourceType: activityLogs.resourceType,
  resourceId: activityLogs.resourceId,
  metadata: activityLogs.metadata,
  createdAt: activityLogs.createdAt,
  actorFirstName: users.firstName,
  actorLastName: users.lastName,
  actorEmail: users.email,
};

export function listActivity(
  organizationId: string,
  resourceType: ActivityResource,
  resourceId: string,
  limit = 50,
) {
  return db
    .select(activityFields)
    .from(activityLogs)
    .leftJoin(users, eq(users.id, activityLogs.actorUserId))
    .where(
      and(
        eq(activityLogs.organizationId, organizationId),
        eq(activityLogs.resourceType, resourceType),
        eq(activityLogs.resourceId, resourceId),
      ),
    )
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}

export function listRecentActivity(organizationId: string, limit = 8) {
  return db
    .select(activityFields)
    .from(activityLogs)
    .leftJoin(users, eq(users.id, activityLogs.actorUserId))
    .where(eq(activityLogs.organizationId, organizationId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}

export type ActivityEntry = Awaited<ReturnType<typeof listActivity>>[number];

export type ActivityListResult = {
  rows: ActivityEntry[];
  total: number;
  pageCount: number;
};

export async function listWorkspaceActivity(organizationId: string, query: ActivityListQuery): Promise<ActivityListResult> {
  const where = and(
    eq(activityLogs.organizationId, organizationId),
    query.resource === "all" ? undefined : eq(activityLogs.resourceType, activityFilterResources[query.resource]),
  );

  const [rows, [{ total }]] = await Promise.all([
    db
      .select(activityFields)
      .from(activityLogs)
      .leftJoin(users, eq(users.id, activityLogs.actorUserId))
      .where(where)
      .orderBy(desc(activityLogs.createdAt), desc(activityLogs.id))
      .limit(ACTIVITY_PAGE_SIZE)
      .offset((query.page - 1) * ACTIVITY_PAGE_SIZE),
    db.select({ total: count() }).from(activityLogs).where(where),
  ]);

  return { rows, total, pageCount: Math.max(1, Math.ceil(total / ACTIVITY_PAGE_SIZE)) };
}

function clearedTrace(ctx: WorkspaceActor, removed: number) {
  return activityInsert({
    organizationId: ctx.organization.id,
    actorUserId: ctx.user.id,
    action: activityActions.activityCleared,
    resourceType: activityResources.organization,
    resourceId: ctx.organization.id,
    metadata: { count: removed },
  });
}

const deletable = ne(activityLogs.action, activityActions.activityCleared);

export async function deleteActivityEntry(ctx: WorkspaceActor, entryId: string): Promise<void> {
  const inWorkspace = and(eq(activityLogs.id, entryId), eq(activityLogs.organizationId, ctx.organization.id));
  const [entry] = await db.select({ action: activityLogs.action }).from(activityLogs).where(inWorkspace).limit(1);

  if (!entry) {
    throw new NotFoundError("This activity entry no longer exists.");
  }

  if (entry.action === activityActions.activityCleared) {
    throw new ValidationError("Clear records are part of the audit trail and can't be deleted.");
  }

  await db.batch([db.delete(activityLogs).where(and(inWorkspace, deletable)), clearedTrace(ctx, 1)]);
}

export async function clearActivity(ctx: WorkspaceActor): Promise<number> {
  const organizationId = ctx.organization.id;

  const result = await db.execute<{ removed: number }>(sql`
    with removed as (
      delete from ${activityLogs}
      where ${activityLogs.organizationId} = ${organizationId}
        and ${activityLogs.action} <> ${activityActions.activityCleared}
      returning 1
    )
    insert into ${activityLogs} (organization_id, actor_user_id, actor_type, action, resource_type, resource_id, metadata)
    select ${organizationId}, ${ctx.user.id}, 'USER', ${activityActions.activityCleared}, ${activityResources.organization},
      ${organizationId}, jsonb_build_object('count', count(*))
    from removed
    having count(*) > 0
    returning (metadata ->> 'count')::int as removed
  `);

  return result.rows[0]?.removed ?? 0;
}
