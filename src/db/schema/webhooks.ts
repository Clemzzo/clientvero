import { index, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { id, timestamps } from "./common";

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: id(),
    provider: varchar("provider", { length: 40 }).notNull(),
    eventId: varchar("event_id", { length: 160 }).notNull().unique("webhook_events_event_uidx"),
    eventType: varchar("event_type", { length: 120 }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    errorMessage: text("error_message"),
    ...timestamps,
  },
  (table) => [index("webhook_events_provider_type_idx").on(table.provider, table.eventType)],
);

export type WebhookEvent = typeof webhookEvents.$inferSelect;
