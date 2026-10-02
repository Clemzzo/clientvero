import "server-only";

import { randomUUID } from "node:crypto";

import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { activityLogs, clients, leads, type Lead } from "@/db/schema";
import { activityActions, activityResources, type ActivityAction, type ActivityResource } from "@/features/activity/activity-actions";
import type { WorkspaceActor } from "@/server/auth/organization";
import { ConflictError } from "@/server/errors";
import { activityInsertIf } from "@/server/services/activity.service";
import { getLead } from "@/server/services/lead.service";

const alreadyConverted = "This lead has already been converted to a client.";

function clientNotes(lead: Lead) {
  const lines = [
    lead.notes,
    lead.service && `Service: ${lead.service}`,
    lead.source && `Source: ${lead.source}`,
  ].filter(Boolean);

  return lines.length ? lines.join("\n\n") : null;
}

function activityIfClientExists(
  ctx: WorkspaceActor,
  clientId: string,
  entry: { action: ActivityAction; resourceType: ActivityResource; resourceId: string; metadata: Record<string, unknown> },
) {
  return activityInsertIf(
    { organizationId: ctx.organization.id, actorUserId: ctx.user.id, ...entry },
    sql`exists (select 1 from ${clients} where ${clients.id} = ${clientId})`,
  );
}

export async function convertLead(ctx: WorkspaceActor, leadId: string): Promise<string> {
  const organizationId = ctx.organization.id;
  const lead = await getLead(organizationId, leadId);

  if (lead.status === "WON") {
    throw new ConflictError(alreadyConverted);
  }

  const clientId = randomUUID();
  const leadIsConvertible = sql`exists (
    select 1 from ${leads}
    where ${leads.id} = ${leadId}
      and ${leads.organizationId} = ${organizationId}
      and ${leads.deletedAt} is null
      and ${leads.status} <> 'WON'
  )`;

  await db.batch([
    db.execute(sql`select pg_advisory_xact_lock(hashtext(${leadId}))`),
    db.execute(sql`
      insert into ${clients} (id, organization_id, name, email, phone, company, website, notes)
      select ${clientId}, ${organizationId}, ${lead.name}, ${lead.email}, ${lead.phone}, ${lead.company}, ${lead.website}, ${clientNotes(lead)}
      where ${leadIsConvertible}
    `),
    db.execute(sql`
      update ${leads} set status = 'WON', updated_at = now()
      where ${leads.id} = ${leadId}
        and ${leads.organizationId} = ${organizationId}
        and exists (select 1 from ${clients} where ${clients.id} = ${clientId})
    `),
    activityIfClientExists(ctx, clientId, {
      action: activityActions.leadConverted,
      resourceType: activityResources.lead,
      resourceId: leadId,
      metadata: { name: lead.name, clientId },
    }),
    activityIfClientExists(ctx, clientId, {
      action: activityActions.clientCreated,
      resourceType: activityResources.client,
      resourceId: clientId,
      metadata: { name: lead.name, fromLeadId: leadId },
    }),
  ]);

  const [created] = await db.select({ id: clients.id }).from(clients).where(eq(clients.id, clientId)).limit(1);

  if (!created) {
    await getLead(organizationId, leadId);
    throw new ConflictError(alreadyConverted);
  }

  return clientId;
}

export async function getConversionClientId(organizationId: string, leadId: string): Promise<string | null> {
  const [entry] = await db
    .select({ clientId: sql<string | null>`${activityLogs.metadata} ->> 'clientId'` })
    .from(activityLogs)
    .where(
      and(
        eq(activityLogs.organizationId, organizationId),
        eq(activityLogs.resourceType, activityResources.lead),
        eq(activityLogs.resourceId, leadId),
        eq(activityLogs.action, activityActions.leadConverted),
      ),
    )
    .orderBy(desc(activityLogs.createdAt))
    .limit(1);

  return entry?.clientId ?? null;
}
