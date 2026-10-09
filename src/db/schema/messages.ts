import { sql } from "drizzle-orm";
import { boolean, index, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { clients } from "./clients";
import { id, timestamps } from "./common";
import { organizations } from "./organizations";
import { projects } from "./projects";
import { users } from "./users";

export const messages = pgTable(
  "messages",
  {
    id: id(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    senderUserId: uuid("sender_user_id").references(() => users.id, { onDelete: "restrict" }),
    content: text("content").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    ...timestamps,
  },
  (table) => [
    index("messages_thread_idx").on(table.organizationId, table.projectId, table.createdAt, table.id),
    index("messages_org_created_idx").on(table.organizationId, table.createdAt),
    index("messages_org_client_idx").on(table.organizationId, table.clientId, table.createdAt),
    index("messages_unread_idx").on(table.organizationId, table.projectId).where(sql`${table.isRead} = false`),
  ],
);

export type Message = typeof messages.$inferSelect;
