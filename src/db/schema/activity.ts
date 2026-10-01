import { index, jsonb, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

import { id, timestamps } from "./common";
import { organizations } from "./organizations";
import { users } from "./users";

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: id(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    actorType: varchar("actor_type", { length: 40 }).notNull().default("USER"),
    action: varchar("action", { length: 100 }).notNull(),
    resourceType: varchar("resource_type", { length: 80 }).notNull(),
    resourceId: uuid("resource_id").notNull(),
    metadata: jsonb("metadata"),
    ...timestamps,
  },
  (table) => [
    index("activity_logs_org_created_idx").on(table.organizationId, table.createdAt),
    index("activity_logs_resource_idx").on(table.resourceType, table.resourceId),
  ],
);

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
