import { index, integer, numeric, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { clients } from "./clients";
import { id, softDelete, timestamps } from "./common";
import { proposalStatusEnum } from "./enums";
import { organizations } from "./organizations";
import { users } from "./users";

const money = (name: string) => numeric(name, { precision: 14, scale: 2 }).notNull().default("0");

export const proposals = pgTable(
  "proposals",
  {
    id: id(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    title: varchar("title", { length: 240 }).notNull(),
    description: text("description"),
    status: proposalStatusEnum("status").notNull().default("DRAFT"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    subtotal: money("subtotal"),
    discount: money("discount"),
    tax: money("tax"),
    total: money("total"),
    timeline: text("timeline"),
    terms: text("terms"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    viewedAt: timestamp("viewed_at", { withTimezone: true }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    declinedAt: timestamp("declined_at", { withTimezone: true }),
    publicId: varchar("public_id", { length: 32 }).notNull().unique(),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    index("proposals_org_idx").on(table.organizationId),
    index("proposals_org_status_idx").on(table.organizationId, table.status),
    index("proposals_org_created_idx").on(table.organizationId, table.createdAt),
    index("proposals_client_idx").on(table.clientId),
  ],
);

export const proposalSections = pgTable(
  "proposal_sections",
  {
    id: id(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    proposalId: uuid("proposal_id")
      .notNull()
      .references(() => proposals.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 240 }).notNull(),
    content: text("content"),
    sectionType: varchar("section_type", { length: 40 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [index("proposal_sections_org_proposal_sort_idx").on(table.organizationId, table.proposalId, table.sortOrder)],
);

export type Proposal = typeof proposals.$inferSelect;
export type ProposalSection = typeof proposalSections.$inferSelect;
export type ProposalStatus = (typeof proposalStatusEnum.enumValues)[number];
