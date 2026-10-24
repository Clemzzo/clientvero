import "server-only";

import { randomUUID } from "node:crypto";

import { and, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { organizationMembers, organizations, users, type Organization } from "@/db/schema";
import { activityActions, activityResources } from "@/features/activity/activity-actions";
import type { WorkspaceActor } from "@/server/auth/organization";
import { activityInsert } from "@/server/services/activity.service";
import type { OnboardingInput } from "@/validators/onboarding";
import type { BusinessInput } from "@/validators/settings";

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

const businessFields = ["name", "businessType", "country", "currency", "website", "address"] as const satisfies readonly (keyof BusinessInput & keyof Organization)[];

export async function updateBusiness(ctx: WorkspaceActor, input: BusinessInput): Promise<void> {
  const changed = businessFields.filter((field) => ctx.organization[field] !== input[field]);

  if (changed.length === 0) {
    return;
  }

  await db.batch([
    db.update(organizations).set(input).where(eq(organizations.id, ctx.organization.id)),
    activityInsert({
      organizationId: ctx.organization.id,
      actorUserId: ctx.user.id,
      action: activityActions.organizationUpdated,
      resourceType: activityResources.organization,
      resourceId: ctx.organization.id,
      metadata: { fields: changed },
    }),
  ]);
}

export async function setLogoKey(organizationId: string, logoKey: string | null): Promise<void> {
  await db.update(organizations).set({ logoKey }).where(eq(organizations.id, organizationId));
}

export async function findLogoKeyBySlug(slug: string): Promise<string | null> {
  const [row] = await db
    .select({ logoKey: organizations.logoKey })
    .from(organizations)
    .where(and(eq(organizations.slug, slug), isNull(organizations.deletedAt)))
    .limit(1);

  return row?.logoKey ?? null;
}
