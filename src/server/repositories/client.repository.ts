import "server-only";

import { and, count, desc, eq, getTableColumns, ilike, isNotNull, isNull, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { clients, portalAccounts, type Client, type PortalAccountStatus } from "@/db/schema";
import { escapeLike } from "@/server/repositories/search";
import { CLIENTS_PAGE_SIZE, type ClientListQuery } from "@/validators/clients";
import type { ArchivedListResult } from "@/types/archived-record";
import type { ArchivedListQuery } from "@/validators/fields";

export type ClientListRow = Client & { portalAccountId: string | null; portalStatus: PortalAccountStatus | null };

export type ClientListResult = {
  rows: ClientListRow[];
  total: number;
  pageCount: number;
};

function clientFilters(organizationId: string, q: string, archived = false) {
  const filters: SQL[] = [
    eq(clients.organizationId, organizationId),
    archived ? isNotNull(clients.deletedAt) : isNull(clients.deletedAt),
  ];

  if (q) {
    const pattern = `%${escapeLike(q)}%`;
    filters.push(or(ilike(clients.name, pattern), ilike(clients.email, pattern), ilike(clients.company, pattern))!);
  }

  return and(...filters);
}

export async function listClients(organizationId: string, query: ClientListQuery): Promise<ClientListResult> {
  const where = clientFilters(organizationId, query.q);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({ ...getTableColumns(clients), portalAccountId: portalAccounts.id, portalStatus: portalAccounts.status })
      .from(clients)
      .leftJoin(
        portalAccounts,
        and(eq(portalAccounts.clientId, clients.id), eq(portalAccounts.organizationId, organizationId)),
      )
      .where(where)
      .orderBy(desc(clients.createdAt), desc(clients.id))
      .limit(CLIENTS_PAGE_SIZE)
      .offset((query.page - 1) * CLIENTS_PAGE_SIZE),
    db.select({ total: count() }).from(clients).where(where),
  ]);

  return { rows, total, pageCount: Math.max(1, Math.ceil(total / CLIENTS_PAGE_SIZE)) };
}

export async function listArchivedClients(
  organizationId: string,
  query: ArchivedListQuery,
): Promise<ArchivedListResult> {
  const where = clientFilters(organizationId, query.q, true);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: clients.id,
        name: clients.name,
        detail: sql<string | null>`coalesce(${clients.company}, ${clients.email})`,
        archivedAt: sql<Date>`${clients.deletedAt}`.mapWith(clients.deletedAt),
      })
      .from(clients)
      .where(where)
      .orderBy(desc(clients.deletedAt), desc(clients.id))
      .limit(CLIENTS_PAGE_SIZE)
      .offset((query.page - 1) * CLIENTS_PAGE_SIZE),
    db.select({ total: count() }).from(clients).where(where),
  ]);

  return { rows, total, pageCount: Math.max(1, Math.ceil(total / CLIENTS_PAGE_SIZE)) };
}
