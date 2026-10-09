import { bigint, boolean, index, pgTable, text, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

import { clients } from "./clients";
import { id, timestamps } from "./common";
import { organizations } from "./organizations";
import { projects } from "./projects";
import { users } from "./users";

export const files = pgTable(
  "files",
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
    uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
    name: varchar("name", { length: 255 }).notNull(),
    objectKey: text("object_key").notNull(),
    mimeType: varchar("mime_type", { length: 160 }).notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    isPublic: boolean("is_public").notNull().default(false),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("files_object_key_uidx").on(table.objectKey),
    index("files_org_project_idx").on(table.organizationId, table.projectId, table.createdAt),
    index("files_org_client_idx").on(table.organizationId, table.clientId),
    index("files_org_created_idx").on(table.organizationId, table.createdAt),
  ],
);

export type StoredFile = typeof files.$inferSelect;
