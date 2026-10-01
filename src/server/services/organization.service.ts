import "server-only";

import { randomUUID } from "node:crypto";

import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { organizationMembers, organizations, users } from "@/db/schema";
import type { OnboardingInput } from "@/validators/onboarding";

export async function hasWorkspace(authUserId: string): Promise<boolean> {
  const [membership] = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .innerJoin(users, eq(users.id, organizationMembers.userId))
    .where(eq(users.authUserId, authUserId))
    .limit(1);

  return Boolean(membership);
}

function slugify(name: string) {
  const base = name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  const suffix = randomUUID().replaceAll("-", "").slice(0, 6);
  return base ? `${base}-${suffix}` : `workspace-${suffix}`;
}

export async function createWorkspace(userId: string, input: OnboardingInput): Promise<void> {
  const organizationId = randomUUID();
  const userHasNoWorkspace = sql`not exists (select 1 from ${organizationMembers} where ${organizationMembers.userId} = ${userId})`;

  await db.batch([
    db.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}))`),
    db.execute(sql`
      insert into ${organizations} (id, name, slug, business_type, country, currency)
      select ${organizationId}, ${input.name}, ${slugify(input.name)}, ${input.businessType}, ${input.country}, ${input.currency}
      where ${userHasNoWorkspace}
    `),
    db.execute(sql`
      insert into ${organizationMembers} (organization_id, user_id, role)
      select id, ${userId}, 'OWNER' from ${organizations} where id = ${organizationId}
    `),
  ]);
}
