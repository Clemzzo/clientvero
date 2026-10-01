import "server-only";

import { randomUUID } from "node:crypto";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { clients, type Client } from "@/db/schema";
import { activityActions, activityResources, type ActivityAction } from "@/features/activity/activity-actions";
import type { WorkspaceActor } from "@/server/auth/organization";
import { NotFoundError } from "@/server/errors";
import { activityInsert } from "@/server/services/activity.service";
import type { ClientFormInput } from "@/validators/clients";

export function clientScope(organizationId: string, clientId: string) {
  return and(eq(clients.id, clientId), eq(clients.organizationId, organizationId), isNull(clients.deletedAt));
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
  const [client] = await db.select().from(clients).where(clientScope(organizationId, clientId)).limit(1);

  if (!client) {
    throw new NotFoundError("This client no longer exists.");
  }

  return client;
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

export async function deleteClient(ctx: WorkspaceActor, clientId: string): Promise<void> {
  const client = await getClient(ctx.organization.id, clientId);

  await db.batch([
    db.update(clients).set({ deletedAt: new Date() }).where(clientScope(ctx.organization.id, clientId)),
    clientActivity(ctx, clientId, activityActions.clientDeleted, { name: client.name }),
  ]);
}
