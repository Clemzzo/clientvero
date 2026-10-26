import { boolean, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { id, timestamps } from "./common";
import { subscriptionStatusEnum } from "./enums";
import { organizations } from "./organizations";

export const subscriptions = pgTable("subscriptions", {
  id: id(),
  organizationId: uuid("organization_id")
    .notNull()
    .unique("subscriptions_org_uidx")
    .references(() => organizations.id, { onDelete: "cascade" }),
  bachsCustomerId: varchar("bachs_customer_id", { length: 160 }).notNull(),
  bachsSubscriptionId: varchar("bachs_subscription_id", { length: 160 }).notNull().unique("subscriptions_bachs_subscription_uidx"),
  bachsProductId: varchar("bachs_product_id", { length: 160 }).notNull(),
  plan: varchar("plan", { length: 20 }).$type<"pro" | "agency">().notNull(),
  status: subscriptionStatusEnum("status").notNull(),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  canceledAt: timestamp("canceled_at", { withTimezone: true }),
  bachsEventAt: timestamp("bachs_event_at", { withTimezone: true, precision: 6 }).notNull(),
  ...timestamps,
});

export type Subscription = typeof subscriptions.$inferSelect;
export type SubscriptionStatus = (typeof subscriptionStatusEnum.enumValues)[number];
