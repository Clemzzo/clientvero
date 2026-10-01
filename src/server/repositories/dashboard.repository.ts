import "server-only";

import { and, count, eq, inArray, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { clients, leads, type LeadStatus } from "@/db/schema";
import { leadStatuses, openLeadStatuses } from "@/features/leads/lead-status";
import { listRecentActivity, type ActivityEntry } from "@/server/services/activity.service";

export type DashboardOverview = {
  leads: {
    total: number;
    open: number;
    newThisWeek: number;
    pipelineValue: string;
    openInOtherCurrencies: number;
    byStatus: Record<LeadStatus, number>;
  };
  clients: { active: number };
  projects: { active: number };
  proposals: { pending: number };
  money: { revenueThisMonth: string; outstanding: string; overdue: string; overdueInvoices: number };
  recentActivity: ActivityEntry[];
};

function leadAggregates(organizationId: string, currency: string) {
  const isOpen = inArray(leads.status, [...openLeadStatuses]);

  return db
    .select({
      total: count(),
      open: sql<number>`count(*) filter (where ${isOpen})`.mapWith(Number),
      newThisWeek: sql<number>`count(*) filter (where ${leads.createdAt} >= now() - interval '7 days')`.mapWith(Number),
      pipelineValue: sql<string>`coalesce(sum(${leads.estimatedValue}) filter (where ${isOpen} and ${leads.currency} = ${currency}), 0)::text`,
      openInOtherCurrencies: sql<number>`count(*) filter (where ${isOpen} and ${leads.estimatedValue} is not null and ${leads.currency} <> ${currency})`.mapWith(Number),
    })
    .from(leads)
    .where(and(eq(leads.organizationId, organizationId), isNull(leads.deletedAt)));
}

function activeClientCount(organizationId: string) {
  return db
    .select({ total: count() })
    .from(clients)
    .where(and(eq(clients.organizationId, organizationId), isNull(clients.deletedAt)));
}

function leadStatusCounts(organizationId: string) {
  return db
    .select({ status: leads.status, total: count() })
    .from(leads)
    .where(and(eq(leads.organizationId, organizationId), isNull(leads.deletedAt)))
    .groupBy(leads.status);
}

export async function getDashboardOverview(organizationId: string, currency: string): Promise<DashboardOverview> {
  const [[aggregates], statusCounts, [clientTotals], recentActivity] = await Promise.all([
    leadAggregates(organizationId, currency),
    leadStatusCounts(organizationId),
    activeClientCount(organizationId),
    listRecentActivity(organizationId),
  ]);

  const byStatus = Object.fromEntries(leadStatuses.map((status) => [status, 0])) as Record<LeadStatus, number>;

  for (const row of statusCounts) {
    byStatus[row.status] = row.total;
  }

  return {
    leads: { ...aggregates, byStatus },
    clients: { active: clientTotals.total },
    projects: { active: 0 },
    proposals: { pending: 0 },
    money: { revenueThisMonth: "0", outstanding: "0", overdue: "0", overdueInvoices: 0 },
    recentActivity,
  };
}
