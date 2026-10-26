import { randomUUID } from "node:crypto";

import { inArray } from "drizzle-orm";

import { db } from "@/db";
import { organizations, subscriptions, users, type NewLead, leads, type SubscriptionStatus } from "@/db/schema";

export async function createTestOrganization(currency = "USD", { plan = "pro" }: { plan?: "free" | "pro" } = {}) {
  const suffix = randomUUID().slice(0, 8);
  const [organization] = await db
    .insert(organizations)
    .values({ name: `Test org ${suffix}`, slug: `test-org-${suffix}`, currency })
    .returning();
  if (plan === "pro") {
    await setTestSubscription(organization.id, "ACTIVE");
  }
  return organization;
}

export async function setTestSubscription(organizationId: string, status: SubscriptionStatus) {
  const suffix = randomUUID();
  const values = {
    organizationId,
    bachsCustomerId: `cust_test_${suffix}`,
    bachsSubscriptionId: `sub_test_${suffix}`,
    bachsProductId: "prod_test_pro",
    plan: "pro" as const,
    status,
    bachsEventAt: new Date(),
  };
  await db
    .insert(subscriptions)
    .values(values)
    .onConflictDoUpdate({ target: subscriptions.organizationId, set: { status } });
}

export async function createTestUser() {
  const suffix = randomUUID();
  const [user] = await db
    .insert(users)
    .values({ authUserId: `test-${suffix}`, email: `test-${suffix}@example.com`, firstName: "Test" })
    .returning();
  return user;
}

export async function insertTestLeads(organizationId: string, rows: Omit<NewLead, "organizationId">[]) {
  return db
    .insert(leads)
    .values(rows.map((row) => ({ ...row, organizationId })))
    .returning();
}

export async function cleanup({ organizationIds, userIds }: { organizationIds: string[]; userIds: string[] }) {
  if (organizationIds.length) {
    await db.delete(organizations).where(inArray(organizations.id, organizationIds));
  }
  if (userIds.length) {
    await db.delete(users).where(inArray(users.id, userIds));
  }
}
