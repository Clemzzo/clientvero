import "server-only";

import { and, asc, count, desc, eq, ilike, inArray, isNull, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { clients, proposals, type ProposalStatus } from "@/db/schema";
import { escapeLike } from "@/server/repositories/search";
import type { Option } from "@/types/option";
import { PROPOSALS_PAGE_SIZE, type ProposalFilter, type ProposalListQuery } from "@/validators/proposals";

const filterStatuses: Record<Exclude<ProposalFilter, "all">, ProposalStatus[]> = {
  draft: ["DRAFT", "WITHDRAWN"],
  sent: ["SENT", "VIEWED"],
  accepted: ["ACCEPTED"],
  declined: ["DECLINED"],
};

const listFields = {
  id: proposals.id,
  title: proposals.title,
  status: proposals.status,
  currency: proposals.currency,
  total: proposals.total,
  sentAt: proposals.sentAt,
  acceptedAt: proposals.acceptedAt,
  declinedAt: proposals.declinedAt,
  createdAt: proposals.createdAt,
  clientId: proposals.clientId,
  clientName: clients.name,
};

export type ProposalListRow = {
  id: string;
  title: string;
  status: ProposalStatus;
  currency: string;
  total: string;
  sentAt: Date | null;
  acceptedAt: Date | null;
  declinedAt: Date | null;
  createdAt: Date;
  clientId: string;
  clientName: string;
};

export type ProposalListResult = {
  rows: ProposalListRow[];
  total: number;
  pageCount: number;
  counts: Record<ProposalFilter, number>;
};

function visibleProposals(organizationId: string) {
  return [eq(proposals.organizationId, organizationId), isNull(proposals.deletedAt)];
}

function searchFilter(q: string) {
  const pattern = `%${escapeLike(q)}%`;
  return or(ilike(proposals.title, pattern), ilike(clients.name, pattern))!;
}

async function countByFilter(organizationId: string, q: string): Promise<Record<ProposalFilter, number>> {
  const filters: SQL[] = visibleProposals(organizationId);
  if (q) filters.push(searchFilter(q));

  const rows = await db
    .select({ status: proposals.status, total: count() })
    .from(proposals)
    .innerJoin(clients, eq(clients.id, proposals.clientId))
    .where(and(...filters))
    .groupBy(proposals.status);

  const counts: Record<ProposalFilter, number> = { all: 0, draft: 0, sent: 0, accepted: 0, declined: 0 };

  for (const row of rows) {
    counts.all += row.total;
    for (const [filter, statuses] of Object.entries(filterStatuses)) {
      if (statuses.includes(row.status)) counts[filter as ProposalFilter] += row.total;
    }
  }

  return counts;
}

export async function listProposals(organizationId: string, query: ProposalListQuery): Promise<ProposalListResult> {
  const filters: SQL[] = visibleProposals(organizationId);
  if (query.q) filters.push(searchFilter(query.q));
  if (query.status !== "all") filters.push(inArray(proposals.status, filterStatuses[query.status]));
  const where = and(...filters);

  const [rows, counts] = await Promise.all([
    db
      .select(listFields)
      .from(proposals)
      .innerJoin(clients, eq(clients.id, proposals.clientId))
      .where(where)
      .orderBy(desc(proposals.createdAt), desc(proposals.id))
      .limit(PROPOSALS_PAGE_SIZE)
      .offset((query.page - 1) * PROPOSALS_PAGE_SIZE),
    countByFilter(organizationId, query.q),
  ]);

  const total = counts[query.status];
  return { rows, total, pageCount: Math.max(1, Math.ceil(total / PROPOSALS_PAGE_SIZE)), counts };
}

export function listClientProposals(organizationId: string, clientId: string): Promise<ProposalListRow[]> {
  return db
    .select(listFields)
    .from(proposals)
    .innerJoin(clients, eq(clients.id, proposals.clientId))
    .where(and(...visibleProposals(organizationId), eq(proposals.clientId, clientId)))
    .orderBy(desc(proposals.createdAt))
    .limit(50);
}

export async function listClientOptions(organizationId: string): Promise<Option[]> {
  const rows = await db
    .select({ value: clients.id, label: clients.name })
    .from(clients)
    .where(and(eq(clients.organizationId, organizationId), isNull(clients.deletedAt)))
    .orderBy(asc(clients.name))
    .limit(500);

  return rows;
}

export async function countPendingProposals(organizationId: string) {
  const [row] = await db
    .select({
      pending: sql<number>`count(*) filter (where ${inArray(proposals.status, ["SENT", "VIEWED"])})`.mapWith(Number),
      sent: sql<number>`count(*) filter (where ${proposals.sentAt} is not null)`.mapWith(Number),
    })
    .from(proposals)
    .where(and(...visibleProposals(organizationId)));

  return row;
}
