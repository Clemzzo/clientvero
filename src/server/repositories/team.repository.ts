import "server-only";

import { and, asc, count, eq, gt, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/db";
import { organizationInvitations, organizationMembers, users, type OrganizationRole } from "@/db/schema";

export type TeamMemberRow = {
  id: string;
  userId: string;
  role: OrganizationRole;
  joinedAt: Date;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatarKey: string | null;
};

export type PendingInvitationRow = {
  id: string;
  email: string;
  role: OrganizationRole;
  expiresAt: Date;
  createdAt: Date;
  inviterFirstName: string | null;
  inviterLastName: string | null;
  inviterEmail: string | null;
};

const roleOrder = sql`case ${organizationMembers.role} when 'OWNER' then 0 when 'ADMIN' then 1 else 2 end`;

export const openInvitation = and(isNull(organizationInvitations.acceptedAt), isNull(organizationInvitations.revokedAt));

export function listMembers(organizationId: string): Promise<TeamMemberRow[]> {
  return db
    .select({
      id: organizationMembers.id,
      userId: organizationMembers.userId,
      role: organizationMembers.role,
      joinedAt: organizationMembers.joinedAt,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      avatarKey: users.avatarKey,
    })
    .from(organizationMembers)
    .innerJoin(users, eq(users.id, organizationMembers.userId))
    .where(eq(organizationMembers.organizationId, organizationId))
    .orderBy(roleOrder, asc(organizationMembers.joinedAt));
}

export function listOpenInvitations(organizationId: string): Promise<PendingInvitationRow[]> {
  const inviter = alias(users, "inviter");

  return db
    .select({
      id: organizationInvitations.id,
      email: organizationInvitations.email,
      role: organizationInvitations.role,
      expiresAt: organizationInvitations.expiresAt,
      createdAt: organizationInvitations.createdAt,
      inviterFirstName: inviter.firstName,
      inviterLastName: inviter.lastName,
      inviterEmail: inviter.email,
    })
    .from(organizationInvitations)
    .leftJoin(inviter, eq(inviter.id, organizationInvitations.invitedBy))
    .where(and(eq(organizationInvitations.organizationId, organizationId), openInvitation))
    .orderBy(asc(organizationInvitations.createdAt));
}

export async function countSeats(organizationId: string, excludeEmail: string): Promise<number> {
  const [[members], [invitations]] = await Promise.all([
    db.select({ total: count() }).from(organizationMembers).where(eq(organizationMembers.organizationId, organizationId)),
    db
      .select({ total: count() })
      .from(organizationInvitations)
      .where(
        and(
          eq(organizationInvitations.organizationId, organizationId),
          openInvitation,
          gt(organizationInvitations.expiresAt, sql`now()`),
          sql`lower(${organizationInvitations.email}) <> ${excludeEmail}`,
        ),
      ),
  ]);

  return members.total + invitations.total;
}

export async function memberWithEmailExists(organizationId: string, email: string): Promise<boolean> {
  const [row] = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .innerJoin(users, eq(users.id, organizationMembers.userId))
    .where(and(eq(organizationMembers.organizationId, organizationId), sql`lower(${users.email}) = ${email}`))
    .limit(1);

  return Boolean(row);
}

export async function findMemberAvatarKey(organizationId: string, userId: string): Promise<string | null> {
  const [row] = await db
    .select({ avatarKey: users.avatarKey })
    .from(organizationMembers)
    .innerJoin(users, eq(users.id, organizationMembers.userId))
    .where(and(eq(organizationMembers.organizationId, organizationId), eq(organizationMembers.userId, userId)))
    .limit(1);

  return row?.avatarKey ?? null;
}
