import "server-only";

import { and, asc, eq, inArray, isNull, ne, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import {
  clients,
  organizations,
  proposalSections,
  proposals,
  type Proposal,
  type ProposalSection,
} from "@/db/schema";
import { activityActions, activityActorTypes, activityResources, type ActivityAction } from "@/features/activity/activity-actions";
import { ConflictError, NotFoundError } from "@/server/errors";
import { activityInsertIf } from "@/server/services/activity.service";
import { getSignerName } from "@/server/services/proposal.service";

export type PublicProposal = Proposal & {
  clientName: string;
  organizationName: string;
  sections: ProposalSection[];
  signerName: string | null;
};

type Response =
  | { kind: "accept"; signerName: string }
  | { kind: "decline"; reason: string | null };

const unavailable = "This proposal is no longer available.";

function publicScope(publicId: string) {
  return and(eq(proposals.publicId, publicId), isNull(proposals.deletedAt));
}

async function findPublicProposal(publicId: string) {
  const [row] = await db
    .select({
      proposal: proposals,
      clientName: clients.name,
      organizationName: organizations.name,
    })
    .from(proposals)
    .innerJoin(clients, eq(clients.id, proposals.clientId))
    .innerJoin(organizations, eq(organizations.id, proposals.organizationId))
    .where(and(publicScope(publicId), ne(proposals.status, "DRAFT")))
    .limit(1);

  return row ?? null;
}

export async function getPublicProposal(publicId: string): Promise<PublicProposal | null> {
  const row = await findPublicProposal(publicId);

  if (!row || row.proposal.status === "WITHDRAWN") {
    return null;
  }

  const [sections, signerName] = await Promise.all([
    db
      .select()
      .from(proposalSections)
      .where(
        and(
          eq(proposalSections.organizationId, row.proposal.organizationId),
          eq(proposalSections.proposalId, row.proposal.id),
        ),
      )
      .orderBy(asc(proposalSections.sortOrder)),
    row.proposal.status === "ACCEPTED" ? getSignerName(row.proposal) : null,
  ]);

  return {
    ...row.proposal,
    clientName: row.clientName,
    organizationName: row.organizationName,
    sections,
    signerName,
  };
}

function clientActivityIf(
  proposal: Pick<Proposal, "id" | "organizationId" | "title">,
  clientName: string,
  action: ActivityAction,
  metadata: Record<string, unknown>,
  condition: SQL,
) {
  return activityInsertIf(
    {
      organizationId: proposal.organizationId,
      actorUserId: null,
      actorType: activityActorTypes.client,
      action,
      resourceType: activityResources.proposal,
      resourceId: proposal.id,
      metadata: { name: proposal.title, clientName, ...metadata },
    },
    condition,
  );
}

export async function markProposalViewed(publicId: string): Promise<void> {
  const row = await findPublicProposal(publicId);

  if (!row || row.proposal.status !== "SENT") {
    return;
  }

  const viewedAt = new Date();

  await db.batch([
    db
      .update(proposals)
      .set({ status: "VIEWED", viewedAt })
      .where(and(publicScope(publicId), eq(proposals.status, "SENT"))),
    clientActivityIf(
      row.proposal,
      row.clientName,
      activityActions.proposalViewed,
      {},
      sql`exists (select 1 from ${proposals} where ${proposals.id} = ${row.proposal.id} and ${proposals.viewedAt} = ${viewedAt})`,
    ),
  ]);
}

async function respond(publicId: string, response: Response): Promise<void> {
  const row = await findPublicProposal(publicId);

  if (!row) {
    throw new NotFoundError(unavailable);
  }

  const respondedAt = new Date();
  const accepting = response.kind === "accept";
  const timestampColumn = accepting ? proposals.acceptedAt : proposals.declinedAt;

  await db.batch([
    db.execute(sql`select pg_advisory_xact_lock(hashtext(${publicId}))`),
    db
      .update(proposals)
      .set(
        accepting
          ? { status: "ACCEPTED", acceptedAt: respondedAt }
          : { status: "DECLINED", declinedAt: respondedAt },
      )
      .where(and(publicScope(publicId), inArray(proposals.status, ["SENT", "VIEWED"]))),
    clientActivityIf(
      row.proposal,
      row.clientName,
      accepting ? activityActions.proposalAccepted : activityActions.proposalDeclined,
      accepting ? { signerName: response.signerName } : { reason: response.reason },
      sql`exists (select 1 from ${proposals} where ${proposals.id} = ${row.proposal.id} and ${timestampColumn} = ${respondedAt})`,
    ),
  ]);

  const [current] = await db.select({ status: proposals.status }).from(proposals).where(publicScope(publicId)).limit(1);
  const wanted = accepting ? "ACCEPTED" : "DECLINED";

  if (current?.status === wanted) return;
  if (current?.status === "WITHDRAWN" || !current) throw new ConflictError(unavailable);
  throw new ConflictError("This proposal has already been answered.");
}

export function acceptProposal(publicId: string, signerName: string): Promise<void> {
  return respond(publicId, { kind: "accept", signerName });
}

export function declineProposal(publicId: string, reason: string | null): Promise<void> {
  return respond(publicId, { kind: "decline", reason });
}
