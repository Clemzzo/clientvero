import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { activityLogs, users } from "@/db/schema";
import type { ActivityAction, ActivityResource } from "@/features/activity/activity-actions";

type ActivityInput = {
  organizationId: string;
  actorUserId: string;
  action: ActivityAction;
  resourceType: ActivityResource;
  resourceId: string;
  metadata?: Record<string, unknown>;
};

export function activityInsert(input: ActivityInput) {
  return db.insert(activityLogs).values(input);
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
