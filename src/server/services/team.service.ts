import "server-only";

import { and, eq, gt, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/db";
import {
  activityLogs,
  notifications,
  organizationInvitations,
  organizationMembers,
  organizations,
  users,
  type OrganizationRole,
  type User,
} from "@/db/schema";
import { activityActions, activityResources } from "@/features/activity/activity-actions";
import { hashToken, newToken, openToken, sealToken } from "@/lib/portal/crypto";
import { personName } from "@/lib/utils/format";
import { invitationUrl } from "@/lib/utils/public-url";
import type { OrganizationContext, WorkspaceActor } from "@/server/auth/organization";
import { ConflictError, NotFoundError, ValidationError } from "@/server/errors";
import {
  countSeats,
  listMembers,
  listOpenInvitations,
  memberWithEmailExists,
  openInvitation,
  type PendingInvitationRow,
  type TeamMemberRow,
} from "@/server/repositories/team.repository";
import { activityInsertIf } from "@/server/services/activity.service";
import type { AssignableRole, InviteMemberInput } from "@/validators/settings";

export const MAX_TEAM_SIZE = 20;
const INVITATION_DAYS = 7;

const invitationMissing = "This invitation no longer exists.";
const memberMissing = "This person is no longer in your workspace.";

export type TeamOverview = {
  members: TeamMemberRow[];
  invitations: PendingInvitationRow[];
};

export async function getTeam(organizationId: string): Promise<TeamOverview> {
  const [members, invitations] = await Promise.all([listMembers(organizationId), listOpenInvitations(organizationId)]);
  return { members, invitations };
}

function teamActivity(ctx: WorkspaceActor, action: (typeof activityActions)[keyof typeof activityActions], metadata: Record<string, unknown>) {
  return {
    organizationId: ctx.organization.id,
    actorUserId: ctx.user.id,
    action,
    resourceType: activityResources.organization,
    resourceId: ctx.organization.id,
    metadata,
  };
}

function teamFull() {
  return new ValidationError(`A workspace can have up to ${MAX_TEAM_SIZE} people, including pending invitations.`);
}

function lockTeam(organizationId: string) {
  return db.execute(sql`select pg_advisory_xact_lock(hashtext(${`team:${organizationId}`}))`);
}

function seatsTaken(organizationId: string, excludeEmail?: string) {
  return sql`(
    (select count(*) from ${organizationMembers} where ${organizationMembers.organizationId} = ${organizationId})
    + (select count(*) from ${organizationInvitations}
        where ${organizationInvitations.organizationId} = ${organizationId}
          and ${organizationInvitations.acceptedAt} is null
          and ${organizationInvitations.revokedAt} is null
          and ${organizationInvitations.expiresAt} > now()
          ${excludeEmail ? sql`and lower(${organizationInvitations.email}) <> ${excludeEmail}` : sql``})
  )`;
}

function hasSeatFor(organizationId: string, email: string) {
  return sql`${seatsTaken(organizationId, email)} < ${MAX_TEAM_SIZE}`;
}

export async function inviteMember(ctx: WorkspaceActor, input: InviteMemberInput): Promise<string> {
  const organizationId = ctx.organization.id;

  if (await memberWithEmailExists(organizationId, input.email)) {
    throw new ConflictError("This person is already in your workspace.");
  }

  if ((await countSeats(organizationId, input.email)) >= MAX_TEAM_SIZE) {
    throw teamFull();
  }

  const { token, hash } = newToken();
  const sameEmail = and(
    eq(organizationInvitations.organizationId, organizationId),
    sql`lower(${organizationInvitations.email}) = ${input.email}`,
    openInvitation,
  );
  const inserted = sql`exists (select 1 from ${organizationInvitations} where ${organizationInvitations.tokenHash} = ${hash})`;

  await db.batch([
    lockTeam(organizationId),
    db.update(organizationInvitations).set({ revokedAt: sql`now()`, tokenSealed: null }).where(and(sameEmail, hasSeatFor(organizationId, input.email))),
    db.execute(sql`
      insert into ${organizationInvitations} (organization_id, email, role, token_hash, token_sealed, invited_by, expires_at)
      select ${organizationId}, ${input.email}, ${input.role}, ${hash}, ${sealToken(token)}, ${ctx.user.id},
        now() + make_interval(days => ${INVITATION_DAYS})
      where ${hasSeatFor(organizationId, input.email)}
    `),
    activityInsertIf(teamActivity(ctx, activityActions.memberInvited, { email: input.email, role: input.role }), inserted),
  ]);

  const [created] = await db
    .select({ id: organizationInvitations.id })
    .from(organizationInvitations)
    .where(eq(organizationInvitations.tokenHash, hash))
    .limit(1);

  if (!created) {
    throw teamFull();
  }

  return invitationUrl(token);
}

function invitationScope(organizationId: string, invitationId: string) {
  return and(eq(organizationInvitations.id, invitationId), eq(organizationInvitations.organizationId, organizationId), openInvitation);
}

export async function invitationLink(ctx: WorkspaceActor, invitationId: string): Promise<string> {
  const [invitation] = await db
    .select({ tokenSealed: organizationInvitations.tokenSealed })
    .from(organizationInvitations)
    .where(and(invitationScope(ctx.organization.id, invitationId), gt(organizationInvitations.expiresAt, sql`now()`)))
    .limit(1);

  const token = invitation?.tokenSealed ? openToken(invitation.tokenSealed) : null;

  if (!token) {
    throw new NotFoundError("This invitation has expired. Send a new one.");
  }

  return invitationUrl(token);
}

export async function revokeInvitation(ctx: WorkspaceActor, invitationId: string): Promise<void> {
  const scope = invitationScope(ctx.organization.id, invitationId);
  const [invitation] = await db.select({ email: organizationInvitations.email }).from(organizationInvitations).where(scope).limit(1);

  if (!invitation) {
    throw new NotFoundError(invitationMissing);
  }

  await db.batch([
    db.update(organizationInvitations).set({ revokedAt: sql`now()`, tokenSealed: null }).where(scope),
    activityInsertIf(
      teamActivity(ctx, activityActions.invitationRevoked, { email: invitation.email }),
      sql`exists (select 1 from ${organizationInvitations} where ${organizationInvitations.id} = ${invitationId} and ${organizationInvitations.revokedAt} = now())`,
    ),
  ]);
}

async function requireOtherMember(ctx: WorkspaceActor, memberId: string) {
  const [member] = await db
    .select({
      id: organizationMembers.id,
      userId: organizationMembers.userId,
      role: organizationMembers.role,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(organizationMembers)
    .innerJoin(users, eq(users.id, organizationMembers.userId))
    .where(and(eq(organizationMembers.id, memberId), eq(organizationMembers.organizationId, ctx.organization.id)))
    .limit(1);

  if (!member) {
    throw new NotFoundError(memberMissing);
  }

  if (member.userId === ctx.user.id) {
    throw new ValidationError("You can't change your own access.");
  }

  if (member.role === "OWNER") {
    throw new ValidationError("The workspace owner can't be changed or removed.");
  }

  return member;
}

function nonOwnerMember(organizationId: string, memberId: string) {
  return and(
    eq(organizationMembers.id, memberId),
    eq(organizationMembers.organizationId, organizationId),
    ne(organizationMembers.role, "OWNER"),
  );
}

export async function changeMemberRole(ctx: WorkspaceActor, memberId: string, role: AssignableRole): Promise<void> {
  const member = await requireOtherMember(ctx, memberId);

  if (member.role === role) {
    return;
  }

  await db.execute(sql`
    with changed as (
      update ${organizationMembers} set role = ${role}, updated_at = now()
      where ${nonOwnerMember(ctx.organization.id, memberId)} and ${organizationMembers.role} <> ${role}
      returning 1
    )
    ${loggedFrom("changed", teamActivity(ctx, activityActions.memberRoleChanged, { name: personName(member), role }))}
  `);
}

type TeamActivity = ReturnType<typeof teamActivity>;

function loggedFrom(changedRows: "changed" | "removed", activity: TeamActivity) {
  return sql`
    insert into ${activityLogs} (organization_id, actor_user_id, actor_type, action, resource_type, resource_id, metadata)
    select ${activity.organizationId}, ${activity.actorUserId}, 'USER', ${activity.action}, ${activity.resourceType},
      ${activity.resourceId}, ${JSON.stringify(activity.metadata)}::jsonb
    from ${sql.raw(changedRows)}
  `;
}

function membershipCleanup(organizationId: string, userId: string) {
  return db
    .delete(notifications)
    .where(and(eq(notifications.organizationId, organizationId), eq(notifications.userId, userId)));
}

export async function removeMember(ctx: WorkspaceActor, memberId: string): Promise<void> {
  const member = await requireOtherMember(ctx, memberId);

  await db.batch([
    db.execute(sql`
      with removed as (
        delete from ${organizationMembers} where ${nonOwnerMember(ctx.organization.id, memberId)}
        returning 1
      )
      ${loggedFrom("removed", teamActivity(ctx, activityActions.memberRemoved, { name: personName(member) }))}
    `),
    membershipCleanup(ctx.organization.id, member.userId),
  ]);
}

export function canLeaveWorkspace(membership: OrganizationContext["membership"]): boolean {
  return membership.role !== "OWNER";
}

export async function leaveWorkspace(ctx: OrganizationContext): Promise<void> {
  if (!canLeaveWorkspace(ctx.membership)) {
    throw new ValidationError("The owner can't leave the workspace.");
  }

  await db.batch([
    db.execute(sql`
      with removed as (
        delete from ${organizationMembers} where ${nonOwnerMember(ctx.organization.id, ctx.membership.id)}
        returning 1
      )
      ${loggedFrom("removed", teamActivity(ctx, activityActions.memberLeft, {}))}
    `),
    membershipCleanup(ctx.organization.id, ctx.user.id),
  ]);
}

export type InvitationState = "open" | "expired" | "revoked" | "accepted";

export type InvitationDetails = {
  id: string;
  organizationId: string;
  email: string;
  role: OrganizationRole;
  state: InvitationState;
  organizationName: string;
  organizationSlug: string;
  logoKey: string | null;
  inviterName: string | null;
};

const inviter = alias(users, "inviter");

const invitationDetailFields = {
  id: organizationInvitations.id,
  organizationId: organizationInvitations.organizationId,
  email: organizationInvitations.email,
  role: organizationInvitations.role,
  expiresAt: organizationInvitations.expiresAt,
  acceptedAt: organizationInvitations.acceptedAt,
  revokedAt: organizationInvitations.revokedAt,
  organizationName: organizations.name,
  organizationSlug: organizations.slug,
  logoKey: organizations.logoKey,
  inviterFirstName: inviter.firstName,
  inviterLastName: inviter.lastName,
  inviterEmail: inviter.email,
};

type InvitationDetailRow = {
  id: string;
  organizationId: string;
  email: string;
  role: OrganizationRole;
  expiresAt: Date;
  acceptedAt: Date | null;
  revokedAt: Date | null;
  organizationName: string;
  organizationSlug: string;
  logoKey: string | null;
  inviterFirstName: string | null;
  inviterLastName: string | null;
  inviterEmail: string | null;
};

function invitationState(row: InvitationDetailRow, now = new Date()): InvitationState {
  if (row.acceptedAt) return "accepted";
  if (row.revokedAt) return "revoked";
  if (row.expiresAt <= now) return "expired";
  return "open";
}

function toDetails(row: InvitationDetailRow): InvitationDetails {
  return {
    id: row.id,
    organizationId: row.organizationId,
    email: row.email,
    role: row.role,
    state: invitationState(row),
    organizationName: row.organizationName,
    organizationSlug: row.organizationSlug,
    logoKey: row.logoKey,
    inviterName: row.inviterEmail
      ? personName({ firstName: row.inviterFirstName, lastName: row.inviterLastName, email: row.inviterEmail })
      : null,
  };
}

function invitationDetailsQuery() {
  return db
    .select(invitationDetailFields)
    .from(organizationInvitations)
    .innerJoin(organizations, eq(organizations.id, organizationInvitations.organizationId))
    .leftJoin(inviter, eq(inviter.id, organizationInvitations.invitedBy));
}

export async function getInvitationByToken(token: string): Promise<InvitationDetails | null> {
  const [row] = await invitationDetailsQuery().where(eq(organizationInvitations.tokenHash, hashToken(token))).limit(1);
  return row ? toDetails(row) : null;
}

export async function pendingInvitationsFor(email: string): Promise<InvitationDetails[]> {
  const rows = await invitationDetailsQuery()
    .where(and(sql`lower(${organizationInvitations.email}) = ${email.toLowerCase()}`, openInvitation, gt(organizationInvitations.expiresAt, sql`now()`)))
    .orderBy(organizationInvitations.createdAt);

  return rows.map(toDetails);
}

async function hasMembership(userId: string, organizationId?: string): Promise<boolean> {
  const [row] = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(and(eq(organizationMembers.userId, userId), organizationId ? eq(organizationMembers.organizationId, organizationId) : undefined))
    .limit(1);

  return Boolean(row);
}

async function requireAcceptable(user: User, invitationId: string) {
  const [row] = await db
    .select({
      organizationId: organizationInvitations.organizationId,
      email: organizationInvitations.email,
      role: organizationInvitations.role,
      expiresAt: organizationInvitations.expiresAt,
      acceptedAt: organizationInvitations.acceptedAt,
      acceptedBy: organizationInvitations.acceptedBy,
      revokedAt: organizationInvitations.revokedAt,
    })
    .from(organizationInvitations)
    .where(eq(organizationInvitations.id, invitationId))
    .limit(1);

  if (!row || row.email.toLowerCase() !== user.email.toLowerCase()) {
    throw new NotFoundError("This invitation isn't for your account. Sign in with the email address it was sent to.");
  }

  return row;
}

export async function acceptInvitation(user: User, invitationId: string): Promise<void> {
  const invitation = await requireAcceptable(user, invitationId);

  if (invitation.acceptedAt) {
    if (invitation.acceptedBy === user.id && (await hasMembership(user.id, invitation.organizationId))) return;
    throw new ConflictError("This invitation has already been used.");
  }

  if (invitation.revokedAt) {
    throw new ConflictError("This invitation was cancelled. Ask for a new one.");
  }

  if (invitation.expiresAt <= new Date()) {
    throw new ConflictError("This invitation has expired. Ask for a new one.");
  }

  if (await hasMembership(user.id)) {
    throw new ConflictError("You already belong to a workspace. Each account can be in one workspace for now.");
  }

  const joinedNow = sql`exists (
    select 1 from ${organizationMembers}
    where ${organizationMembers.userId} = ${user.id}
      and ${organizationMembers.organizationId} = ${invitation.organizationId}
      and ${organizationMembers.createdAt} = now()
  )`;

  await db.batch([
    db.execute(sql`select pg_advisory_xact_lock(hashtext(${user.id}))`),
    lockTeam(invitation.organizationId),
    db.execute(sql`
      insert into ${organizationMembers} (organization_id, user_id, role)
      select ${organizationInvitations.organizationId}, ${user.id}, ${organizationInvitations.role}
      from ${organizationInvitations}
      where ${organizationInvitations.id} = ${invitationId}
        and ${organizationInvitations.acceptedAt} is null
        and ${organizationInvitations.revokedAt} is null
        and ${organizationInvitations.expiresAt} > now()
        and lower(${organizationInvitations.email}) = ${user.email.toLowerCase()}
        and not exists (select 1 from ${organizationMembers} where ${organizationMembers.userId} = ${user.id})
        and (select count(*) from ${organizationMembers} where ${organizationMembers.organizationId} = ${invitation.organizationId}) < ${MAX_TEAM_SIZE}
    `),
    db
      .update(organizationInvitations)
      .set({ acceptedAt: sql`now()`, acceptedBy: user.id, tokenSealed: null })
      .where(and(eq(organizationInvitations.id, invitationId), joinedNow)),
    activityInsertIf(
      {
        organizationId: invitation.organizationId,
        actorUserId: user.id,
        action: activityActions.memberJoined,
        resourceType: activityResources.organization,
        resourceId: invitation.organizationId,
        metadata: { role: invitation.role },
      },
      joinedNow,
    ),
  ]);

  if (!(await hasMembership(user.id, invitation.organizationId))) {
    throw new ConflictError("We couldn't add you to this workspace. It may be full, or the invitation may have changed. Ask for a new one.");
  }
}

export async function acceptInvitationByToken(user: User, token: string): Promise<void> {
  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    throw new NotFoundError(invitationMissing);
  }

  await acceptInvitation(user, invitation.id);
}
