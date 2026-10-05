import "server-only";

import { randomUUID } from "node:crypto";

import { and, eq, isNotNull, isNull, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { activityLogs, clients, projects, proposals, type Client } from "@/db/schema";
import { activityActions, activityResources, type ActivityAction } from "@/features/activity/activity-actions";
import type { WorkspaceActor } from "@/server/auth/organization";
import { ConflictError, NotFoundError } from "@/server/errors";
import { activityInsert, activityInsertIf } from "@/server/services/activity.service";
import type { ClientFormInput } from "@/validators/clients";

function ownedClientScope(organizationId: string, clientId: string) {
  return and(eq(clients.id, clientId), eq(clients.organizationId, organizationId));
}

export function clientScope(organizationId: string, clientId: string) {
  return and(ownedClientScope(organizationId, clientId), isNull(clients.deletedAt));
}

function archivedClientScope(organizationId: string, clientId: string) {
  return and(ownedClientScope(organizationId, clientId), isNotNull(clients.deletedAt));
}

async function findClient(where: SQL | undefined): Promise<Client> {
  const [client] = await db.select().from(clients).where(where).limit(1);

  if (!client) {
    throw new NotFoundError("This client no longer exists.");
  }

  return client;
}

export function clientActivity(
  ctx: WorkspaceActor,
  clientId: string,
  action: ActivityAction,
  metadata: Record<string, unknown>,
) {
  return activityInsert({
    organizationId: ctx.organization.id,
    actorUserId: ctx.user.id,
    action,
    resourceType: activityResources.client,
    resourceId: clientId,
    metadata,
  });
}

export async function getClient(organizationId: string, clientId: string): Promise<Client> {
  return findClient(clientScope(organizationId, clientId));
}

export async function createClient(ctx: WorkspaceActor, input: ClientFormInput): Promise<string> {
  const clientId = randomUUID();

  await db.batch([
    db.insert(clients).values({ ...input, id: clientId, organizationId: ctx.organization.id }),
    clientActivity(ctx, clientId, activityActions.clientCreated, { name: input.name }),
  ]);

  return clientId;
}

export async function updateClient(ctx: WorkspaceActor, clientId: string, input: ClientFormInput): Promise<void> {
  await getClient(ctx.organization.id, clientId);

  await db.batch([
    db.update(clients).set(input).where(clientScope(ctx.organization.id, clientId)),
    clientActivity(ctx, clientId, activityActions.clientUpdated, { name: input.name }),
  ]);
}

export async function archiveClient(ctx: WorkspaceActor, clientId: string): Promise<void> {
  const client = await getClient(ctx.organization.id, clientId);

  await db.batch([
    db.update(clients).set({ deletedAt: new Date() }).where(clientScope(ctx.organization.id, clientId)),
    clientActivity(ctx, clientId, activityActions.clientDeleted, { name: client.name }),
  ]);
}

export async function restoreClient(ctx: WorkspaceActor, clientId: string): Promise<void> {
  const client = await findClient(archivedClientScope(ctx.organization.id, clientId));

  await db.batch([
    db.update(clients).set({ deletedAt: null }).where(archivedClientScope(ctx.organization.id, clientId)),
    clientActivity(ctx, clientId, activityActions.clientRestored, { name: client.name }),
  ]);
}

const clientHasRecords =
  "This client has proposals or projects, so it can't be deleted permanently. Archive it instead.";

function hasProposalsOrProjects(clientId: string) {
  return sql`(
    exists (select 1 from ${proposals} where ${proposals.clientId} = ${clientId})
    or exists (select 1 from ${projects} where ${projects.clientId} = ${clientId})
  )`;
}

// Proposals and projects are commercial records, so a client with any (even archived ones) is never hard-deleted.
// Its activity history is removed and only the deletion itself stays in the audit trail.
export async function deleteClientPermanently(ctx: WorkspaceActor, clientId: string): Promise<void> {
  const organizationId = ctx.organization.id;
  const client = await findClient(ownedClientScope(organizationId, clientId));

  const [proposal, project] = await Promise.all([
    db
      .select({ id: proposals.id })
      .from(proposals)
      .where(and(eq(proposals.organizationId, organizationId), eq(proposals.clientId, clientId)))
      .limit(1),
    db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.organizationId, organizationId), eq(projects.clientId, clientId)))
      .limit(1),
  ]);

  if (proposal.length > 0 || project.length > 0) {
    throw new ConflictError(clientHasRecords);
  }

  // Re-checked inside the batch so a proposal or project created in the meantime blocks the delete
  // instead of leaving the client with its history wiped.
  const clientIsGone = sql`not exists (select 1 from ${clients} where ${clients.id} = ${clientId})`;

  const [deleted] = await db.batch([
    db
      .delete(clients)
      .where(
        and(
          ownedClientScope(organizationId, clientId),
          sql`not ${hasProposalsOrProjects(clientId)}`,
        ),
      )
      .returning({ id: clients.id }),
    db
      .delete(activityLogs)
      .where(
        and(
          eq(activityLogs.organizationId, organizationId),
          eq(activityLogs.resourceType, activityResources.client),
          eq(activityLogs.resourceId, clientId),
          clientIsGone,
        ),
      ),
    activityInsertIf(
      {
        organizationId,
        actorUserId: ctx.user.id,
        action: activityActions.clientDeletedPermanently,
        resourceType: activityResources.client,
        resourceId: clientId,
        metadata: { name: client.name },
      },
      clientIsGone,
    ),
  ]);

  if (deleted.length === 0) {
    throw new ConflictError(clientHasRecords);
  }
}
