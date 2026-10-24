import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/db";
import { clients, invoices, proposals } from "@/db/schema";
import type { PlanLimits } from "@/features/subscriptions/plans";
import { countActiveProjects } from "@/server/repositories/project.repository";

export type PlanUsage = Record<keyof PlanLimits, number>;

function createdThisMonth(column: typeof proposals.createdAt | typeof invoices.createdAt, timeZone: string) {
  return sql`(${column} at time zone ${timeZone}) >= date_trunc('month', now() at time zone ${timeZone})`;
}

export async function getPlanUsage(organizationId: string, timeZone: string): Promise<PlanUsage> {
  const [counts, projects] = await Promise.all([
    db.execute<{ clients: number; proposals: number; invoices: number }>(sql`
      select
        (select count(*)::int from ${clients} where ${clients.organizationId} = ${organizationId} and ${clients.deletedAt} is null) as clients,
        (select count(*)::int from ${proposals} where ${proposals.organizationId} = ${organizationId}
          and ${createdThisMonth(proposals.createdAt, timeZone)}) as proposals,
        (select count(*)::int from ${invoices} where ${invoices.organizationId} = ${organizationId}
          and ${createdThisMonth(invoices.createdAt, timeZone)}) as invoices
    `),
    countActiveProjects(organizationId),
  ]);

  const row = counts.rows[0];

  return {
    clients: Number(row?.clients ?? 0),
    activeProjects: projects.active,
    proposalsPerMonth: Number(row?.proposals ?? 0),
    invoicesPerMonth: Number(row?.invoices ?? 0),
  };
}
