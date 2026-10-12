import { date, index, integer, numeric, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

import { clients } from "./clients";
import { id, money, softDelete, timestamps } from "./common";
import { invoiceStatusEnum } from "./enums";
import { organizations } from "./organizations";
import { projects } from "./projects";
import { users } from "./users";

export const invoices = pgTable(
  "invoices",
  {
    id: id(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    invoiceNumber: varchar("invoice_number", { length: 32 }).notNull(),
    status: invoiceStatusEnum("status").notNull().default("DRAFT"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    subtotal: money("subtotal"),
    discount: money("discount"),
    total: money("total"),
    amountPaid: money("amount_paid"),
    amountDue: money("amount_due"),
    notes: text("notes"),
    paymentInstructions: text("payment_instructions"),
    publicId: varchar("public_id", { length: 32 }).notNull().unique(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    viewedAt: timestamp("viewed_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex("invoices_org_number_uidx").on(table.organizationId, table.invoiceNumber),
    index("invoices_org_idx").on(table.organizationId),
    index("invoices_org_status_idx").on(table.organizationId, table.status),
    index("invoices_org_due_date_idx").on(table.organizationId, table.dueDate),
    index("invoices_org_created_idx").on(table.organizationId, table.createdAt),
    index("invoices_client_idx").on(table.clientId),
    index("invoices_project_idx").on(table.projectId),
  ],
);

export const invoiceItems = pgTable(
  "invoice_items",
  {
    id: id(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    description: varchar("description", { length: 500 }).notNull(),
    quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull(),
    unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [index("invoice_items_org_invoice_sort_idx").on(table.organizationId, table.invoiceId, table.sortOrder)],
);

export type Invoice = typeof invoices.$inferSelect;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InvoiceStatus = (typeof invoiceStatusEnum.enumValues)[number];
