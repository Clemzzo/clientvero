import "server-only";

import type { PlanLimits } from "@/features/subscriptions/plans";
import { resolveTimeZone } from "@/lib/utils/timezone";
import type { WorkspaceActor } from "@/server/auth/organization";
import { PlanLimitError } from "@/server/errors";
import { getPlanUsage } from "@/server/repositories/plan-usage.repository";
import { getWorkspacePlan } from "@/server/services/subscription.service";

export type PlanLimitKey = keyof PlanLimits;

const limitNouns: Record<PlanLimitKey, (limit: number) => string> = {
  clients: (limit) => `${limit} ${limit === 1 ? "client" : "clients"}`,
  activeProjects: (limit) => `${limit} active ${limit === 1 ? "project" : "projects"}`,
  proposalsPerMonth: (limit) => `${limit} ${limit === 1 ? "proposal" : "proposals"} a month`,
  invoicesPerMonth: (limit) => `${limit} ${limit === 1 ? "invoice" : "invoices"} a month`,
};

export async function requireWithinPlan(ctx: WorkspaceActor, key: PlanLimitKey): Promise<void> {
  const { plan } = await getWorkspacePlan(ctx.organization.id);
  const limit = plan.limits[key];

  if (limit === null) return;

  const usage = await getPlanUsage(ctx.organization.id, resolveTimeZone(ctx.user.timezone));

  if (usage[key] >= limit) {
    throw new PlanLimitError(
      `Your ${plan.name} plan includes ${limitNouns[key](limit)}. Upgrade in Settings → Billing to add more — owners and admins can upgrade.`,
    );
  }
}
