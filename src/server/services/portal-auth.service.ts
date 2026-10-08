import "server-only";

import { and, eq, gt, isNotNull, isNull, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import { clients, organizations, portalAccounts, portalSessions, portalSetupTokens } from "@/db/schema";
import { activityActions, activityActorTypes, activityResources } from "@/features/activity/activity-actions";
import { hashPassword, hashToken, newToken, verifyPassword } from "@/lib/portal/crypto";
import { portalSessionExpiry } from "@/server/auth/portal-session";
import { AuthenticationError, ValidationError } from "@/server/errors";
import { activityInsertIf } from "@/server/services/activity.service";

export type PortalSetupLink = {
  tokenId: string;
  accountId: string;
  organizationId: string;
  organizationName: string;
  clientId: string;
  clientName: string;
  email: string;
  isReset: boolean;
};

export type PortalSessionGrant = { token: string; expiresAt: Date };

const linkExpired = "This link has expired or has already been used. Ask for a new one.";
const wrongCredentials = "Email or password is incorrect.";

const portalOpen = and(
  eq(clients.portalEnabled, true),
  isNull(clients.deletedAt),
  isNull(organizations.deletedAt),
  eq(clients.organizationId, portalAccounts.organizationId),
);

let dummyHash: Promise<string> | undefined;

function compareWithDummy(password: string) {
  dummyHash ??= hashPassword("portal-dummy-password");
  return dummyHash.then((hash) => verifyPassword(password, hash));
}

function sessionInsert(organizationId: string, accountId: string) {
  const { token, hash } = newToken();
  const expiresAt = portalSessionExpiry();

  return {
    grant: { token, expiresAt },
    values: { organizationId, portalAccountId: accountId, tokenHash: hash, expiresAt },
  };
}

export async function getPortalOrganization(slug: string): Promise<{ name: string } | null> {
  const [organization] = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(and(eq(organizations.slug, slug), isNull(organizations.deletedAt)))
    .limit(1);

  return organization ?? null;
}

export async function getSetupLink(slug: string, token: string): Promise<PortalSetupLink | null> {
  const [row] = await db
    .select({
      tokenId: portalSetupTokens.id,
      accountId: portalAccounts.id,
      organizationId: organizations.id,
      organizationName: organizations.name,
      clientId: clients.id,
      clientName: clients.name,
      email: portalAccounts.email,
      passwordHash: portalAccounts.passwordHash,
    })
    .from(portalSetupTokens)
    .innerJoin(portalAccounts, eq(portalAccounts.id, portalSetupTokens.portalAccountId))
    .innerJoin(clients, eq(clients.id, portalAccounts.clientId))
    .innerJoin(organizations, eq(organizations.id, portalAccounts.organizationId))
    .where(
      and(
        eq(portalSetupTokens.tokenHash, hashToken(token)),
        isNull(portalSetupTokens.usedAt),
        gt(portalSetupTokens.expiresAt, new Date()),
        ne(portalAccounts.status, "REVOKED"),
        eq(organizations.slug, slug),
        portalOpen,
      ),
    )
    .limit(1);

  if (!row) {
    return null;
  }

  const { passwordHash, ...link } = row;
  return { ...link, isReset: passwordHash !== null };
}

export async function completeSetup(slug: string, token: string, password: string): Promise<PortalSessionGrant> {
  const link = await getSetupLink(slug, token);

  if (!link) {
    throw new ValidationError(linkExpired);
  }

  const passwordHash = await hashPassword(password);
  const usedAt = new Date();
  const session = sessionInsert(link.organizationId, link.accountId);
  const claimedByThisRequest = sql`exists (
    select 1 from ${portalSetupTokens}
    where ${portalSetupTokens.id} = ${link.tokenId} and ${portalSetupTokens.usedAt} = ${usedAt}
  )`;

  const [claimed] = await db.batch([
    db
      .update(portalSetupTokens)
      .set({ usedAt, tokenSealed: null })
      .where(and(eq(portalSetupTokens.id, link.tokenId), isNull(portalSetupTokens.usedAt)))
      .returning({ id: portalSetupTokens.id }),
    db
      .update(portalAccounts)
      .set({
        passwordHash,
        status: "ACTIVE",
        activatedAt: sql`coalesce(${portalAccounts.activatedAt}, ${usedAt})`,
        lastSignInAt: usedAt,
      })
      .where(and(eq(portalAccounts.id, link.accountId), ne(portalAccounts.status, "REVOKED"), claimedByThisRequest)),
    db.delete(portalSessions).where(and(eq(portalSessions.portalAccountId, link.accountId), claimedByThisRequest)),
    db.execute(sql`
      insert into ${portalSessions} (organization_id, portal_account_id, token_hash, expires_at)
      select ${session.values.organizationId}, ${session.values.portalAccountId}, ${session.values.tokenHash}, ${session.values.expiresAt}
      where ${claimedByThisRequest}
    `),
    activityInsertIf(
      {
        organizationId: link.organizationId,
        actorUserId: null,
        actorType: activityActorTypes.client,
        action: activityActions.portalActivated,
        resourceType: activityResources.client,
        resourceId: link.clientId,
        metadata: { clientName: link.clientName },
      },
      link.isReset ? sql`false` : claimedByThisRequest,
    ),
  ]);

  if (claimed.length === 0) {
    throw new ValidationError(linkExpired);
  }

  return session.grant;
}

export async function signIn(slug: string, email: string, password: string): Promise<PortalSessionGrant> {
  const [account] = await db
    .select({ id: portalAccounts.id, organizationId: portalAccounts.organizationId, passwordHash: portalAccounts.passwordHash })
    .from(portalAccounts)
    .innerJoin(clients, eq(clients.id, portalAccounts.clientId))
    .innerJoin(organizations, eq(organizations.id, portalAccounts.organizationId))
    .where(
      and(
        eq(organizations.slug, slug),
        sql`lower(${portalAccounts.email}) = ${email.toLowerCase()}`,
        eq(portalAccounts.status, "ACTIVE"),
        isNotNull(portalAccounts.passwordHash),
        portalOpen,
      ),
    )
    .limit(1);

  let valid = false;

  if (account?.passwordHash) {
    valid = await verifyPassword(password, account.passwordHash);
  } else {
    await compareWithDummy(password);
  }

  if (!account || !valid) {
    throw new AuthenticationError(wrongCredentials);
  }

  const session = sessionInsert(account.organizationId, account.id);

  await db.batch([
    db.insert(portalSessions).values(session.values),
    db.update(portalAccounts).set({ lastSignInAt: new Date() }).where(eq(portalAccounts.id, account.id)),
  ]);

  return session.grant;
}

export async function signOut(token: string): Promise<void> {
  await db.delete(portalSessions).where(eq(portalSessions.tokenHash, hashToken(token)));
}
