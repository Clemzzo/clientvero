import { describe, expect, it } from "vitest";

import type { OrganizationContext } from "@/server/auth/organization";
import { checkoutIdempotencyKey } from "@/server/services/subscription.service";

const ctx = (userId: string, organizationId = "org-1") =>
  ({ user: { id: userId }, organization: { id: organizationId } }) as OrganizationContext;

describe("checkout idempotency key", () => {
  const tenPast = Date.UTC(2026, 9, 27, 10, 10);
  const fiftyPast = Date.UTC(2026, 9, 27, 10, 50);
  const nextHour = Date.UTC(2026, 9, 27, 11, 5);

  it("is the same for repeat checkouts of one plan by one person within the hour", () => {
    expect(checkoutIdempotencyKey(ctx("u1"), "pro", tenPast)).toBe(checkoutIdempotencyKey(ctx("u1"), "pro", fiftyPast));
  });

  it("changes with the plan, the person, the workspace and the hour", () => {
    const key = checkoutIdempotencyKey(ctx("u1"), "pro", tenPast);
    expect(checkoutIdempotencyKey(ctx("u1"), "agency", tenPast)).not.toBe(key);
    expect(checkoutIdempotencyKey(ctx("u2"), "pro", tenPast)).not.toBe(key);
    expect(checkoutIdempotencyKey(ctx("u1", "org-2"), "pro", tenPast)).not.toBe(key);
    expect(checkoutIdempotencyKey(ctx("u1"), "pro", nextHour)).not.toBe(key);
  });
});
