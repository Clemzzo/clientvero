import "server-only";

import { and, count, desc, eq, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { notifications, organizationMembers } from "@/db/schema";
import type { ActivityResource } from "@/features/activity/activity-actions";
import { notificationHref, type EmittedNotificationType } from "@/features/notifications/notification-types";
import type { WorkspaceActor } from "@/server/auth/organization";
import { NotFoundError } from "@/server/errors";
import { NOTIFICATION_PAGE_SIZE, type NotificationListQuery } from "@/validators/notifications";

type NotifyInput = {
  organizationId: string;
  type: EmittedNotificationType;
  title: string;
  message: string;
  resourceType: ActivityResource;
  resourceId: string;
  excludeUserId?: string;
};

export const recipientUserId = sql.raw("recipient.user_id");

export function notifyMembersIf(input: NotifyInput, condition: SQL) {
  return db.execute(sql`
    insert into ${notifications} (organization_id, user_id, type, title, message, resource_type, resource_id)
    select ${input.organizationId}::uuid, ${recipientUserId}, ${input.type}::notification_type, ${input.title}, ${input.message},
      ${input.resourceType}, ${input.resourceId}::uuid
    from ${organizationMembers} recipient
    where recipient.organization_id = ${input.organizationId}::uuid
      ${input.excludeUserId ? sql`and ${recipientUserId} <> ${input.excludeUserId}::uuid` : sql``}
      and ${condition}
  `);
}

export function hasUnreadNotification(type: EmittedNotificationType, resourceId: string) {
  return sql`exists (
    select 1 from ${notifications}
    where ${notifications.userId} = ${recipientUserId}
      and ${notifications.type} = ${type}::notification_type
      and ${notifications.resourceId} = ${resourceId}::uuid
      and ${notifications.isRead} = false
  )`;
}

function ownedBy(actor: WorkspaceActor) {
  return and(eq(notifications.organizationId, actor.organization.id), eq(notifications.userId, actor.user.id));
}

export type NotificationSummary = {
  unread: number;
  latestAt: string | null;
};

export async function notificationSummary(actor: WorkspaceActor): Promise<NotificationSummary> {
  const mine = ownedBy(actor);

  const [[{ unread }], [latest]] = await Promise.all([
    db.select({ unread: count() }).from(notifications).where(and(mine, eq(notifications.isRead, false))),
    db
      .select({ createdAt: notifications.createdAt })
      .from(notifications)
      .where(mine)
      .orderBy(desc(notifications.createdAt))
      .limit(1),
  ]);

  return { unread, latestAt: latest?.createdAt.toISOString() ?? null };
}

export type NotificationRow = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  href: string;
};

export type NotificationListResult = {
  rows: NotificationRow[];
  total: number;
  pageCount: number;
};

export async function listNotifications(actor: WorkspaceActor, query: NotificationListQuery): Promise<NotificationListResult> {
  const where = and(ownedBy(actor), query.filter === "unread" ? eq(notifications.isRead, false) : undefined);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
        resourceId: notifications.resourceId,
      })
      .from(notifications)
      .where(where)
      .orderBy(desc(notifications.createdAt), desc(notifications.id))
      .limit(NOTIFICATION_PAGE_SIZE)
      .offset((query.page - 1) * NOTIFICATION_PAGE_SIZE),
    db.select({ total: count() }).from(notifications).where(where),
  ]);

  return {
    rows: rows.map(({ resourceId, ...row }) => ({ ...row, href: notificationHref(row.type, resourceId) })),
    total,
    pageCount: Math.max(1, Math.ceil(total / NOTIFICATION_PAGE_SIZE)),
  };
}

export async function openNotification(actor: WorkspaceActor, notificationId: string, markRead: boolean): Promise<string> {
  const mine = and(eq(notifications.id, notificationId), ownedBy(actor));
  const [notification] = await db
    .select({ type: notifications.type, resourceId: notifications.resourceId, isRead: notifications.isRead })
    .from(notifications)
    .where(mine)
    .limit(1);

  if (!notification) {
    throw new NotFoundError("This notification no longer exists.");
  }

  if (markRead && !notification.isRead) {
    await db.update(notifications).set({ isRead: true, readAt: new Date() }).where(and(mine, eq(notifications.isRead, false)));
  }

  return notificationHref(notification.type, notification.resourceId);
}

export async function markAllNotificationsRead(actor: WorkspaceActor): Promise<number> {
  const marked = await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(ownedBy(actor), eq(notifications.isRead, false)))
    .returning({ id: notifications.id });

  return marked.length;
}
