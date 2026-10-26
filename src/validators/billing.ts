import { z } from "zod";

import type { SubscriptionStatus } from "@/db/schema";

export const paidPlanIdSchema = z.enum(["pro", "agency"]);

export const subscriptionEventTypes = [
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
] as const;

const bachsStatuses = {
  trialing: "TRIALING",
  active: "ACTIVE",
  past_due: "PAST_DUE",
  unpaid: "UNPAID",
  paused: "PAUSED",
  canceled: "CANCELLED",
} as const satisfies Record<string, SubscriptionStatus>;

const isoTimestamp = z.iso.datetime({ offset: true });

export const bachsEventEnvelopeSchema = z.object({
  id: z.string().startsWith("evt_").max(160),
  type: z.string().min(1).max(120),
  created_at: isoTimestamp,
});

export const bachsSubscriptionDataSchema = z.object({
  subscription_id: z.string().startsWith("sub_").max(160),
  customer: z.object({ customer_id: z.string().min(1).max(160) }),
  product_id: z.string().startsWith("prod_").max(160),
  status: z.enum(Object.keys(bachsStatuses) as [keyof typeof bachsStatuses]).transform((status) => bachsStatuses[status]),
  current_period_start: isoTimestamp.nullish(),
  current_period_end: isoTimestamp.nullish(),
  cancel_at_period_end: z.boolean().default(false),
  canceled_at: isoTimestamp.nullish(),
  metadata: z.record(z.string(), z.unknown()).nullish(),
});

export const bachsSubscriptionEventSchema = bachsEventEnvelopeSchema.extend({
  type: z.enum(subscriptionEventTypes),
  data: bachsSubscriptionDataSchema,
});

export type BachsSubscriptionEvent = z.infer<typeof bachsSubscriptionEventSchema>;
