import "server-only";

import { and, count, desc, eq, ilike, isNotNull, isNull, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { leads, type Lead, type LeadStatus } from "@/db/schema";
import { leadStatuses, openLeadStatuses } from "@/features/leads/lead-status";
import type { PipelineColumn } from "@/features/leads/move-lead";
import { escapeLike } from "@/server/repositories/search";
import type { ArchivedListResult } from "@/types/archived-record";
import type { ArchivedListQuery } from "@/validators/fields";
import { LEADS_PAGE_SIZE } from "@/validators/leads";

const PIPELINE_COLUMN_LIMIT = 25;

export type LeadListResult = {
  rows: Lead[];
  total: number;
  pageCount: number;
};

export type LeadPipelineResult = {
  columns: PipelineColumn[];
  closed: Record<"WON" | "LOST", number>;
};

type LeadFilterOptions = { q: string; status?: LeadStatus; archived?: boolean };

function leadFilters(organizationId: string, { q, status, archived = false }: LeadFilterOptions) {
  const filters: SQL[] = [
    eq(leads.organizationId, organizationId),
    archived ? isNotNull(leads.deletedAt) : isNull(leads.deletedAt),
  ];

  if (status) {
    filters.push(eq(leads.status, status));
  }

  if (q) {
    const pattern = `%${escapeLike(q)}%`;
    filters.push(or(ilike(leads.name, pattern), ilike(leads.email, pattern), ilike(leads.company, pattern))!);
  }

  return and(...filters);
}

export async function listLeads(
  organizationId: string,
  query: { q: string; status?: LeadStatus; page: number },
): Promise<LeadListResult> {
  const where = leadFilters(organizationId, query);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(leads)
      .where(where)
      .orderBy(desc(leads.createdAt), desc(leads.id))
      .limit(LEADS_PAGE_SIZE)
      .offset((query.page - 1) * LEADS_PAGE_SIZE),
    db.select({ total: count() }).from(leads).where(where),
  ]);

  return { rows, total, pageCount: Math.max(1, Math.ceil(total / LEADS_PAGE_SIZE)) };
}

export async function listArchivedLeads(organizationId: string, query: ArchivedListQuery): Promise<ArchivedListResult> {
  const where = leadFilters(organizationId, { q: query.q, archived: true });

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: leads.id,
        name: leads.name,
        detail: sql<string | null>`coalesce(${leads.company}, ${leads.email})`,
        archivedAt: sql<Date>`${leads.deletedAt}`.mapWith(leads.deletedAt),
      })
      .from(leads)
      .where(where)
      .orderBy(desc(leads.deletedAt), desc(leads.id))
      .limit(LEADS_PAGE_SIZE)
      .offset((query.page - 1) * LEADS_PAGE_SIZE),
    db.select({ total: count() }).from(leads).where(where),
  ]);

  return { rows, total, pageCount: Math.max(1, Math.ceil(total / LEADS_PAGE_SIZE)) };
}

export async function pipelineLeads(organizationId: string, query: { q: string }): Promise<LeadPipelineResult> {
  const where = leadFilters(organizationId, query);

  const ranked = db
    .select({
      id: leads.id,
      rank: sql<number>`row_number() over (partition by ${leads.status} order by ${leads.createdAt} desc, ${leads.id} desc)`.as(
        "rank",
      ),
    })
    .from(leads)
    .where(where)
    .as("ranked");

  const [cards, totals] = await Promise.all([
    db
      .select({ lead: leads })
      .from(leads)
      .innerJoin(ranked, eq(ranked.id, leads.id))
      .where(sql`${ranked.rank} <= ${PIPELINE_COLUMN_LIMIT}`)
      .orderBy(desc(leads.createdAt), desc(leads.id)),
    db.select({ status: leads.status, total: count() }).from(leads).where(where).groupBy(leads.status),
  ]);

  const totalByStatus = Object.fromEntries(leadStatuses.map((status) => [status, 0])) as Record<LeadStatus, number>;
  for (const row of totals) {
    totalByStatus[row.status] = row.total;
  }

  const columns = openLeadStatuses.map((status) => ({
    status,
    leads: cards.map((card) => card.lead).filter((lead) => lead.status === status),
    total: totalByStatus[status],
  }));

  return { columns, closed: { WON: totalByStatus.WON, LOST: totalByStatus.LOST } };
}
