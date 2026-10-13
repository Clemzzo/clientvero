import { sql } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { id } from "./common";
import { notificationTypeEnum } from "./enums";
import { organizations } from "./organizations";
import { users } from "./users";

export const notifications = pgTable(
  "notifications",
  {
    id: id(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 240 }).notNull(),
    message: text("message").notNull(),
    resourceType: varchar("resource_type", { length: 80 }),
    resourceId: uuid("resource_id"),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (table) => [
    index("notifications_user_feed_idx").on(table.organizationId, table.userId, table.createdAt.desc(), table.id),
    index("notifications_user_unread_idx")
      .on(table.organizationId, table.userId)
      .where(sql`${table.isRead} = false`),
  ],
);

export type Notification = typeof notifications.$inferSelect;
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];
