import "server-only";

import { randomBytes, randomUUID } from "node:crypto";

import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { activityLogs, clients, proposalSections, proposals, type Proposal, type ProposalSection } from "@/db/schema";
import { activityActions, activityResources, type ActivityAction } from "@/features/activity/activity-actions";
import { isEditable } from "@/features/proposals/proposal-status";
import { proposalTotal } from "@/lib/utils/money";
import type { WorkspaceActor } from "@/server/auth/organization";
import { ConflictError, NotFoundError, ValidationError } from "@/server/errors";
import { activityInsert, activityInsertIf } from "@/server/services/activity.service";
import { getClient } from "@/server/services/client.service";
import type { ProposalFormInput } from "@/validators/proposals";

export type ProposalDetail = Proposal & {
  clientName: string;
  sections: ProposalSection[];
};

const proposalMissing = "This proposal no longer exists.";

function proposalScope(organizationId: string, proposalId: string) {
  return and(eq(proposals.id, proposalId), eq(proposals.organizationId, organizationId), isNull(proposals.deletedAt));
}

function proposalActivity(ctx: WorkspaceActor, proposalId: string, action: ActivityAction, title: string) {
  return activityInsert({
    organizationId: ctx.organization.id,
    actorUserId: ctx.user.id,
    action,
    resourceType: activityResources.proposal,
    resourceId: proposalId,
    metadata: { name: title },
  });
}

function proposalActivityIf(
  ctx: WorkspaceActor,
  proposalId: string,
  action: ActivityAction,
  title: string,
  statusChangedAt: { column: typeof proposals.sentAt | typeof proposals.updatedAt; at: Date },
) {
  return activityInsertIf(
    {
      organizationId: ctx.organization.id,
      actorUserId: ctx.user.id,
      action,
      resourceType: activityResources.proposal,
      resourceId: proposalId,
      metadata: { name: title },
    },
    sql`exists (select 1 from ${proposals} where ${proposals.id} = ${proposalId} and ${statusChangedAt.column} = ${statusChangedAt.at})`,
  );
}

function sectionRows(organizationId: string, proposalId: string, input: ProposalFormInput) {
  return input.sections.map((section, index) => ({
    organizationId,
    proposalId,
    title: section.title,
    content: section.content || null,
    sectionType: section.sectionType,
    sortOrder: index,
  }));
}

function proposalValues(input: ProposalFormInput) {
  return {
    clientId: input.clientId,
    title: input.title,
    description: input.description,
    currency: input.currency,
    subtotal: input.subtotal,
    discount: input.discount,
    tax: input.tax,
    total: proposalTotal(input),
    timeline: input.timeline,
    terms: input.terms,
  };
}

export async function getSignerName(proposal: Pick<Proposal, "id" | "organizationId">) {
  const [entry] = await db
    .select({ signerName: sql<string | null>`${activityLogs.metadata} ->> 'signerName'` })
    .from(activityLogs)
    .where(
      and(
        eq(activityLogs.organizationId, proposal.organizationId),
        eq(activityLogs.resourceType, activityResources.proposal),
        eq(activityLogs.resourceId, proposal.id),
        eq(activityLogs.action, activityActions.proposalAccepted),
      ),
    )
    .orderBy(desc(activityLogs.createdAt))
    .limit(1);

  return entry?.signerName ?? null;
}

export function generatePublicId() {
  return randomBytes(16).toString("base64url");
}

export async function getProposal(organizationId: string, proposalId: string): Promise<ProposalDetail> {
  const [row] = await db
    .select({ proposal: proposals, clientName: clients.name })
    .from(proposals)
    .innerJoin(clients, eq(clients.id, proposals.clientId))
    .where(proposalScope(organizationId, proposalId))
    .limit(1);

  if (!row) {
    throw new NotFoundError(proposalMissing);
  }

  const sections = await db
    .select()
    .from(proposalSections)
    .where(and(eq(proposalSections.organizationId, organizationId), eq(proposalSections.proposalId, proposalId)))
    .orderBy(asc(proposalSections.sortOrder));

  return { ...row.proposal, clientName: row.clientName, sections };
}

export async function createProposal(ctx: WorkspaceActor, input: ProposalFormInput): Promise<string> {
  await getClient(ctx.organization.id, input.clientId);
  const proposalId = randomUUID();

  await db.batch([
    db.insert(proposals).values({
      ...proposalValues(input),
      id: proposalId,
      organizationId: ctx.organization.id,
      createdBy: ctx.user.id,
      publicId: generatePublicId(),
    }),
    db.insert(proposalSections).values(sectionRows(ctx.organization.id, proposalId, input)),
    proposalActivity(ctx, proposalId, activityActions.proposalCreated, input.title),
  ]);

  return proposalId;
}

export async function updateProposal(ctx: WorkspaceActor, proposalId: string, input: ProposalFormInput): Promise<void> {
  const organizationId = ctx.organization.id;
  const proposal = await getProposal(organizationId, proposalId);

  if (!isEditable(proposal.status)) {
    throw new ConflictError("Sent proposals can't be edited. Withdraw it first.");
  }

  await getClient(organizationId, input.clientId);
  const editable = and(proposalScope(organizationId, proposalId), inArray(proposals.status, ["DRAFT", "WITHDRAWN"]));

  await db.batch([
    db.update(proposals).set(proposalValues(input)).where(editable),
    db
      .delete(proposalSections)
      .where(and(eq(proposalSections.organizationId, organizationId), eq(proposalSections.proposalId, proposalId))),
    db.insert(proposalSections).values(sectionRows(organizationId, proposalId, input)),
    proposalActivity(ctx, proposalId, activityActions.proposalUpdated, input.title),
  ]);
}

export async function sendProposal(ctx: WorkspaceActor, proposalId: string): Promise<string> {
  const proposal = await getProposal(ctx.organization.id, proposalId);

  if (proposal.sections.length === 0) {
    throw new ValidationError("Add at least one section before sending.");
  }

  const sentAt = new Date();

  const [[sent]] = await db.batch([
    db
      .update(proposals)
      .set({ status: "SENT", sentAt, viewedAt: null })
      .where(and(proposalScope(ctx.organization.id, proposalId), inArray(proposals.status, ["DRAFT", "WITHDRAWN"])))
      .returning({ publicId: proposals.publicId }),
    proposalActivityIf(ctx, proposalId, activityActions.proposalSent, proposal.title, { column: proposals.sentAt, at: sentAt }),
  ]);

  if (!sent) {
    throw new ConflictError("This proposal has already been sent.");
  }

  return sent.publicId;
}

export async function withdrawProposal(ctx: WorkspaceActor, proposalId: string): Promise<void> {
  const proposal = await getProposal(ctx.organization.id, proposalId);

  const withdrawnAt = new Date();

  const [[withdrawn]] = await db.batch([
    db
      .update(proposals)
      .set({ status: "WITHDRAWN", updatedAt: withdrawnAt })
      .where(and(proposalScope(ctx.organization.id, proposalId), inArray(proposals.status, ["SENT", "VIEWED"])))
      .returning({ id: proposals.id }),
    proposalActivityIf(ctx, proposalId, activityActions.proposalWithdrawn, proposal.title, {
      column: proposals.updatedAt,
      at: withdrawnAt,
    }),
  ]);

  if (!withdrawn) {
    throw new ConflictError("Only proposals waiting for a response can be withdrawn.");
  }
}
