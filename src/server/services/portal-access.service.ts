import "server-only";

import { randomUUID } from "node:crypto";

import { and, desc, eq, gt, inArray, isNotNull, isNull, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import { clients, portalAccounts, portalSessions, portalSetupTokens } from "@/db/schema";
import { activityActions } from "@/features/activity/activity-actions";
import { newToken, openToken, sealToken } from "@/lib/portal/crypto";
import { portalSetupUrl } from "@/lib/utils/public-url";
import type { WorkspaceActor } from "@/server/auth/organization";
import { ConflictError, NotFoundError, ValidationError } from "@/server/errors";
import { clientActivity, clientScope, getClient } from "@/server/services/client.service";

const SETUP_LINK_DAYS = 7;

function setupLinkExpiry() {
  return new Date(Date.now() + SETUP_LINK_DAYS * 24 * 60 * 60 * 1000);
}

function invalidateOpenLinks(accountIds: string[] | ReturnType<typeof sql>) {
  return db
    .update(portalSetupTokens)
    .set({ usedAt: new Date(), tokenSealed: null })
    .where(and(inArray(portalSetupTokens.portalAccountId, accountIds), isNull(portalSetupTokens.usedAt)));
}

function newSetupLink(ctx: WorkspaceActor, accountId: string) {
  const { token, hash } = newToken();

  return {
    url: portalSetupUrl(ctx.organization.slug, token),
    insert: db.insert(portalSetupTokens).values({
      organizationId: ctx.organization.id,
      portalAccountId: accountId,
      tokenHash: hash,
      tokenSealed: sealToken(token),
      expiresAt: setupLinkExpiry(),
      createdBy: ctx.user.id,
    }),
  };
}

function enablePortal(ctx: WorkspaceActor, clientId: string) {
  return db
    .update(clients)
    .set({ portalEnabled: true, portalInvitedAt: new Date() })
    .where(clientScope(ctx.organization.id, clientId));
}

async function getAccount(organizationId: string, accountId: string) {
  const [account] = await db
    .select({
      id: portalAccounts.id,
      clientId: portalAccounts.clientId,
      status: portalAccounts.status,
      clientName: clients.name,
    })
    .from(portalAccounts)
    .innerJoin(clients, eq(clients.id, portalAccounts.clientId))
    .where(and(eq(portalAccounts.id, accountId), eq(portalAccounts.organizationId, organizationId)))
    .limit(1);

  if (!account) {
    throw new NotFoundError("This portal access no longer exists.");
  }

  return account;
}

export async function invitePortalClient(ctx: WorkspaceActor, clientId: string): Promise<string> {
  const organizationId = ctx.organization.id;
  const client = await getClient(organizationId, clientId);

  if (!client.email) {
    throw new ValidationError("Add an email address to this client before inviting them.");
  }

  const email = client.email.toLowerCase();
  const [[existing], [emailTaken]] = await Promise.all([
    db
      .select({ id: portalAccounts.id, status: portalAccounts.status })
      .from(portalAccounts)
      .where(and(eq(portalAccounts.clientId, clientId), eq(portalAccounts.organizationId, organizationId)))
      .limit(1),
    db
      .select({ id: portalAccounts.id })
      .from(portalAccounts)
      .where(
        and(
          eq(portalAccounts.organizationId, organizationId),
          sql`lower(${portalAccounts.email}) = ${email}`,
          ne(portalAccounts.clientId, clientId),
        ),
      )
      .limit(1),
  ]);

  if (existing && existing.status !== "REVOKED") {
    throw new ConflictError("This client already has portal access. Create a new link instead.");
  }

  if (emailTaken) {
    throw new ConflictError("Another client already uses this email for the portal.");
  }

  const accountId = existing?.id ?? randomUUID();
  const link = newSetupLink(ctx, accountId);
  const invitation = { email, status: "INVITED" as const, invitedBy: ctx.user.id, invitedAt: new Date() };

  await db.batch([
    existing
      ? db
          .update(portalAccounts)
          .set({ ...invitation, passwordHash: null, activatedAt: null, revokedAt: null })
          .where(eq(portalAccounts.id, accountId))
      : db.insert(portalAccounts).values({ ...invitation, id: accountId, organizationId, clientId }),
    db.delete(portalSessions).where(eq(portalSessions.portalAccountId, accountId)),
    invalidateOpenLinks([accountId]),
    link.insert,
    enablePortal(ctx, clientId),
    clientActivity(ctx, clientId, activityActions.portalInvited, { name: client.name }),
  ]);

  return link.url;
}

export async function issuePortalLink(ctx: WorkspaceActor, accountId: string): Promise<string> {
  const account = await getAccount(ctx.organization.id, accountId);

  if (account.status === "REVOKED") {
    throw new ValidationError("This client's access was revoked. Invite them again instead.");
  }

  await getClient(ctx.organization.id, account.clientId);
  const link = newSetupLink(ctx, account.id);

  await db.batch([
    invalidateOpenLinks([account.id]),
    link.insert,
    enablePortal(ctx, account.clientId),
    clientActivity(ctx, account.clientId, activityActions.portalLinkIssued, { name: account.clientName }),
  ]);

  return link.url;
}

export async function getOpenPortalLink(ctx: WorkspaceActor, accountId: string): Promise<string> {
  const account = await getAccount(ctx.organization.id, accountId);

  if (account.status === "REVOKED") {
    throw new ValidationError("This client's access was revoked. Invite them again instead.");
  }

  await getClient(ctx.organization.id, account.clientId);

  const [link] = await db
    .select({ tokenSealed: portalSetupTokens.tokenSealed })
    .from(portalSetupTokens)
    .where(
      and(
        eq(portalSetupTokens.portalAccountId, account.id),
        eq(portalSetupTokens.organizationId, ctx.organization.id),
        isNull(portalSetupTokens.usedAt),
        gt(portalSetupTokens.expiresAt, new Date()),
        isNotNull(portalSetupTokens.tokenSealed),
      ),
    )
    .orderBy(desc(portalSetupTokens.createdAt))
    .limit(1);

  const token = link?.tokenSealed ? openToken(link.tokenSealed) : null;

  if (!token) {
    throw new ConflictError("There's no open link for this client. Create a new one instead.");
  }

  return portalSetupUrl(ctx.organization.slug, token);
}

export async function revokePortalAccess(ctx: WorkspaceActor, accountId: string): Promise<void> {
  const account = await getAccount(ctx.organization.id, accountId);

  if (account.status === "REVOKED") {
    return;
  }

  await db.batch([
    db
      .update(portalAccounts)
      .set({ status: "REVOKED", revokedAt: new Date() })
      .where(and(eq(portalAccounts.id, account.id), eq(portalAccounts.organizationId, ctx.organization.id))),
    db.delete(portalSessions).where(eq(portalSessions.portalAccountId, account.id)),
    invalidateOpenLinks([account.id]),
    clientActivity(ctx, account.clientId, activityActions.portalAccessRevoked, { name: account.clientName }),
  ]);
}

export async function disableClientPortal(ctx: WorkspaceActor, clientId: string): Promise<void> {
  const organizationId = ctx.organization.id;
  const client = await getClient(organizationId, clientId);

  if (!client.portalEnabled) {
    return;
  }

  const clientAccounts = sql`(
    select ${portalAccounts.id} from ${portalAccounts}
    where ${portalAccounts.organizationId} = ${organizationId} and ${portalAccounts.clientId} = ${clientId}
  )`;

  await db.batch([
    db.update(clients).set({ portalEnabled: false }).where(clientScope(organizationId, clientId)),
    db.delete(portalSessions).where(inArray(portalSessions.portalAccountId, clientAccounts)),
    invalidateOpenLinks(clientAccounts),
    clientActivity(ctx, clientId, activityActions.portalDisabled, { name: client.name }),
  ]);
}
