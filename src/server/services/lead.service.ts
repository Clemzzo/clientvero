import "server-only";

import { randomUUID } from "node:crypto";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { leads, type Lead, type LeadStatus } from "@/db/schema";
import { activityActions, activityResources, type ActivityAction } from "@/features/activity/activity-actions";
import type { WorkspaceActor } from "@/server/auth/organization";
import { NotFoundError, ValidationError } from "@/server/errors";
import { activityInsert } from "@/server/services/activity.service";
import type { LeadFormInput } from "@/validators/leads";

function leadScope(organizationId: string, leadId: string) {
  return and(eq(leads.id, leadId), eq(leads.organizationId, organizationId), isNull(leads.deletedAt));
}

function leadActivity(ctx: WorkspaceActor, leadId: string, action: ActivityAction, metadata: Record<string, unknown>) {
  return activityInsert({
    organizationId: ctx.organization.id,
    actorUserId: ctx.user.id,
    action,
    resourceType: activityResources.lead,
    resourceId: leadId,
    metadata,
  });
}

export async function getLead(organizationId: string, leadId: string): Promise<Lead> {
  const [lead] = await db.select().from(leads).where(leadScope(organizationId, leadId)).limit(1);

  if (!lead) {
    throw new NotFoundError("This lead no longer exists.");
  }

  return lead;
}

export async function createLead(ctx: WorkspaceActor, input: LeadFormInput): Promise<string> {
  const leadId = randomUUID();

  await db.batch([
    db.insert(leads).values({
      ...input,
      id: leadId,
      organizationId: ctx.organization.id,
      currency: input.currency || ctx.organization.currency,
    }),
    leadActivity(ctx, leadId, activityActions.leadCreated, { name: input.name }),
  ]);

  return leadId;
}

export async function updateLead(ctx: WorkspaceActor, leadId: string, input: LeadFormInput): Promise<void> {
  await getLead(ctx.organization.id, leadId);

  await db.batch([
    db.update(leads).set(input).where(leadScope(ctx.organization.id, leadId)),
    leadActivity(ctx, leadId, activityActions.leadUpdated, { name: input.name }),
  ]);
}

export async function deleteLead(ctx: WorkspaceActor, leadId: string): Promise<void> {
  const lead = await getLead(ctx.organization.id, leadId);

  await db.batch([
    db.update(leads).set({ deletedAt: new Date() }).where(leadScope(ctx.organization.id, leadId)),
    leadActivity(ctx, leadId, activityActions.leadDeleted, { name: lead.name }),
  ]);
}

export async function changeLeadStatus(ctx: WorkspaceActor, leadId: string, status: LeadStatus): Promise<void> {
  if (status === "WON") {
    throw new ValidationError("Leads are marked won when you convert them to a client.");
  }

  const lead = await getLead(ctx.organization.id, leadId);

  if (lead.status === "WON") {
    throw new ValidationError("This lead was converted to a client, so its status can't change.");
  }

  if (lead.status === status) {
    return;
  }

  await db.batch([
    db.update(leads).set({ status }).where(leadScope(ctx.organization.id, leadId)),
    leadActivity(ctx, leadId, activityActions.leadStatusChanged, { name: lead.name, from: lead.status, to: status }),
  ]);
}
