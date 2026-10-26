import { describe, expect, it } from "vitest";

import { hasPaidAccess } from "@/features/subscriptions/subscription-status";
import { bachsSubscriptionEventSchema, paidPlanIdSchema } from "@/validators/billing";

const event = {
  id: "evt_1",
  type: "customer.subscription.updated",
  created_at: "2026-10-26T12:00:00.123456Z",
  organization_id: "acct_1",
  data: {
    subscription_id: "sub_1",
    customer: { customer_id: "cust_1", email: "a@example.com", name: "A" },
    product_id: "prod_pro",
    status: "past_due",
    current_period_start: "2026-10-01T00:00:00Z",
    current_period_end: "2026-11-01T00:00:00Z",
    cancel_at_period_end: false,
    canceled_at: null,
    metadata: { organization_id: "00000000-0000-0000-0000-000000000000" },
    amount: "5.00",
  },
};

describe("billing validators", () => {
  it("maps Bachs statuses to ClientVero statuses and keeps unknown fields out", () => {
    const parsed = bachsSubscriptionEventSchema.parse(event);
    expect(parsed.data.status).toBe("PAST_DUE");
    expect(bachsSubscriptionEventSchema.parse({ ...event, data: { ...event.data, status: "canceled" } }).data.status).toBe(
      "CANCELLED",
    );
  });

  it("rejects unknown statuses and event types", () => {
    expect(bachsSubscriptionEventSchema.safeParse({ ...event, data: { ...event.data, status: "incomplete" } }).success).toBe(false);
    expect(bachsSubscriptionEventSchema.safeParse({ ...event, type: "invoice.paid" }).success).toBe(false);
  });

  it("only accepts paid plan ids", () => {
    expect(paidPlanIdSchema.safeParse("pro").success).toBe(true);
    expect(paidPlanIdSchema.safeParse("free").success).toBe(false);
  });

  it("grants the paid plan only while active or trialing", () => {
    expect(hasPaidAccess("ACTIVE")).toBe(true);
    expect(hasPaidAccess("TRIALING")).toBe(true);
    expect(hasPaidAccess("PAST_DUE")).toBe(false);
    expect(hasPaidAccess("UNPAID")).toBe(false);
    expect(hasPaidAccess("PAUSED")).toBe(false);
    expect(hasPaidAccess("CANCELLED")).toBe(false);
  });
});
