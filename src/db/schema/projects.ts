import { sql } from "drizzle-orm";
import { date, index, integer, numeric, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

import { clients } from "./clients";
import { id, softDelete, timestamps } from "./common";
import { milestoneStatusEnum, projectStatusEnum } from "./enums";
import { organizations } from "./organizations";
import { proposals } from "./proposals";
import { users } from "./users";

export const projects = pgTable(
  "projects",
  {
    id: id(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
    proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "set null" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 240 }).notNull(),
    description: text("description"),
    status: projectStatusEnum("status").notNull().default("PLANNING"),
    budget: numeric("budget", { precision: 14, scale: 2 }),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    startDate: date("start_date"),
    dueDate: date("due_date"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    index("projects_org_idx").on(table.organizationId),
    index("projects_org_status_idx").on(table.organizationId, table.status),
    index("projects_client_idx").on(table.clientId),
    index("projects_due_date_idx").on(table.organizationId, table.dueDate),
    uniqueIndex("projects_proposal_uidx")
      .on(table.proposalId)
      .where(sql`${table.proposalId} is not null and ${table.deletedAt} is null`),
  ],
);

export const milestones = pgTable(
  "milestones",
  {
    id: id(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 240 }).notNull(),
    description: text("description"),
    status: milestoneStatusEnum("status").notNull().default("PENDING"),
    dueDate: date("due_date"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("milestones_org_project_idx").on(table.organizationId, table.projectId, table.sortOrder),
    index("milestones_org_status_idx").on(table.organizationId, table.status),
  ],
);

export type Project = typeof projects.$inferSelect;
export type Milestone = typeof milestones.$inferSelect;
export type ProjectStatus = (typeof projectStatusEnum.enumValues)[number];
export type MilestoneStatus = (typeof milestoneStatusEnum.enumValues)[number];
