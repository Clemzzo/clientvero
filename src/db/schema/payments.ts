import { index, jsonb, numeric, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { id, timestamps } from "./common";
import { paymentStatusEnum } from "./enums";
import { invoices } from "./invoices";
import { organizations } from "./organizations";
import { users } from "./users";

export type PaymentMetadata = {
  method: string;
  note: string | null;
};

export const payments = pgTable(
  "payments",
  {
    id: id(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id),
    recordedBy: uuid("recorded_by").references(() => users.id, { onDelete: "set null" }),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    status: paymentStatusEnum("status").notNull().default("SUCCEEDED"),
    provider: varchar("provider", { length: 40 }).notNull().default("MANUAL"),
    providerPaymentId: varchar("provider_payment_id", { length: 255 }),
    reference: varchar("reference", { length: 120 }),
    paidAt: timestamp("paid_at", { withTimezone: true }).notNull(),
    metadata: jsonb("metadata").$type<PaymentMetadata>(),
    ...timestamps,
  },
  (table) => [
    index("payments_org_invoice_idx").on(table.organizationId, table.invoiceId),
    index("payments_org_paid_at_idx").on(table.organizationId, table.paidAt),
  ],
);

export type Payment = typeof payments.$inferSelect;
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
