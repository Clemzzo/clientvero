import { randomUUID } from "node:crypto";

import { inArray } from "drizzle-orm";

import { db } from "@/db";
import { organizations, users, type NewLead, leads } from "@/db/schema";

export async function createTestOrganization(currency = "USD") {
  const suffix = randomUUID().slice(0, 8);
  const [organization] = await db
    .insert(organizations)
    .values({ name: `Test org ${suffix}`, slug: `test-org-${suffix}`, currency })
    .returning();
  return organization;
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
