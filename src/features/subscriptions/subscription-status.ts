import type { SubscriptionStatus } from "@/db/schema";

export const subscriptionStatuses = [
  "TRIALING",
  "ACTIVE",
  "PAST_DUE",
  "UNPAID",
  "PAUSED",
  "CANCELLED",
] as const satisfies readonly SubscriptionStatus[];

export const paidAccessStatuses = ["TRIALING", "ACTIVE"] as const satisfies readonly SubscriptionStatus[];

export const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  TRIALING: "Trialing",
  ACTIVE: "Active",
  PAST_DUE: "Past due",
  UNPAID: "Unpaid",
  PAUSED: "Paused",
  CANCELLED: "Cancelled",
};

export function hasPaidAccess(status: SubscriptionStatus): boolean {
  return (paidAccessStatuses as readonly SubscriptionStatus[]).includes(status);
}
