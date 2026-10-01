import { sql } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

import { id, softDelete, timestamps } from "./common";
import { organizations } from "./organizations";

export const clients = pgTable(
  "clients",
  {
    id: id(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 40 }),
    company: varchar("company", { length: 200 }),
    website: text("website"),
    address: text("address"),
    country: varchar("country", { length: 120 }),
    notes: text("notes"),
    portalEnabled: boolean("portal_enabled").notNull().default(false),
    portalInvitedAt: timestamp("portal_invited_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    index("clients_org_idx").on(table.organizationId),
    index("clients_org_email_idx").on(table.organizationId, table.email),
    index("clients_org_created_idx").on(table.organizationId, table.createdAt),
  ],
);

export const clientContacts = pgTable(
  "client_contacts",
  {
    id: id(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 40 }),
    role: varchar("role", { length: 120 }),
    isPrimary: boolean("is_primary").notNull().default(false),
    ...timestamps,
  },
  (table) => [
    index("client_contacts_org_client_idx").on(table.organizationId, table.clientId),
    uniqueIndex("client_contacts_one_primary_uidx").on(table.clientId).where(sql`${table.isPrimary}`),
  ],
);

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type ClientContact = typeof clientContacts.$inferSelect;
