import "server-only";

import { and, count, desc, eq, getTableColumns, ilike, isNull, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { clientContacts, clients, type Client } from "@/db/schema";
import { escapeLike } from "@/server/repositories/search";
import { CLIENTS_PAGE_SIZE, type ClientListQuery } from "@/validators/clients";

export type ClientListRow = Client & { contactCount: number };

export type ClientListResult = {
  rows: ClientListRow[];
  total: number;
  pageCount: number;
};

function clientFilters(organizationId: string, q: string) {
  const filters: SQL[] = [eq(clients.organizationId, organizationId), isNull(clients.deletedAt)];

  if (q) {
    const pattern = `%${escapeLike(q)}%`;
    filters.push(or(ilike(clients.name, pattern), ilike(clients.email, pattern), ilike(clients.company, pattern))!);
  }

  return and(...filters);
}

export async function listClients(organizationId: string, query: ClientListQuery): Promise<ClientListResult> {
  const where = clientFilters(organizationId, query.q);

  const contactCounts = db
    .select({ clientId: clientContacts.clientId, total: count().as("contact_total") })
    .from(clientContacts)
    .where(eq(clientContacts.organizationId, organizationId))
    .groupBy(clientContacts.clientId)
    .as("contact_counts");

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({ ...getTableColumns(clients), contactCount: sql<number>`coalesce(${contactCounts.total}, 0)`.mapWith(Number) })
      .from(clients)
      .leftJoin(contactCounts, eq(contactCounts.clientId, clients.id))
      .where(where)
      .orderBy(desc(clients.createdAt), desc(clients.id))
      .limit(CLIENTS_PAGE_SIZE)
      .offset((query.page - 1) * CLIENTS_PAGE_SIZE),
    db.select({ total: count() }).from(clients).where(where),
  ]);

  return { rows, total, pageCount: Math.max(1, Math.ceil(total / CLIENTS_PAGE_SIZE)) };
}
