import { index, numeric, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { id, softDelete, timestamps } from "./common";
import { leadStatusEnum } from "./enums";
import { organizations } from "./organizations";
import { users } from "./users";

export const leads = pgTable(
  "leads",
  {
    id: id(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
    name: varchar("name", { length: 200 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 40 }),
    company: varchar("company", { length: 200 }),
    website: text("website"),
    source: varchar("source", { length: 100 }),
    service: varchar("service", { length: 160 }),
    estimatedValue: numeric("estimated_value", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }),
    status: leadStatusEnum("status").notNull().default("NEW"),
    notes: text("notes"),
    lastContactedAt: timestamp("last_contacted_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    index("leads_org_idx").on(table.organizationId),
    index("leads_org_status_idx").on(table.organizationId, table.status),
    index("leads_org_created_idx").on(table.organizationId, table.createdAt),
  ],
);

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type LeadStatus = (typeof leadStatusEnum.enumValues)[number];
