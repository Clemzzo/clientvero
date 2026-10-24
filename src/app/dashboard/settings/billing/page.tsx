import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gauge } from "lucide-react";

import { PlanOptionCard } from "@/components/settings/PlanOptionCard";
import { PlanUsageMeter } from "@/components/settings/PlanUsageMeter";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { Card, CardHeader } from "@/components/ui/card";
import { formatPlanPrice, getPlan, plans, type PlanLimits } from "@/features/subscriptions/plans";
import { resolveTimeZone } from "@/lib/utils/timezone";
import { requireOrganizationContext } from "@/server/auth/organization";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { getPlanUsage } from "@/server/repositories/plan-usage.repository";

export const metadata: Metadata = {
  title: "Billing",
};

const usageLabels: Record<keyof PlanLimits, string> = {
  clients: "Clients",
  activeProjects: "Active projects",
  proposalsPerMonth: "Proposals this month",
  invoicesPerMonth: "Invoices this month",
};

export default async function BillingSettingsPage() {
  const ctx = await requireOrganizationContext();

  if (!hasPermission(ctx.membership.role, permissions.billingRead)) {
    notFound();
  }

  const currentPlan = getPlan("free");
  const usage = await getPlanUsage(ctx.organization.id, resolveTimeZone(ctx.user.timezone));
  const upgrades = plans.filter((plan) => plan.id !== currentPlan.id);
  const limitKeys = Object.keys(usageLabels) as (keyof PlanLimits)[];

  return (
    <div className="space-y-6">
      <SettingsHeader title="Billing" description="Your ClientVero plan and how much of it you're using." />

      <Card>
        <CardHeader
          title={`${currentPlan.name} plan`}
          description={`${formatPlanPrice(currentPlan)}/month · ${currentPlan.audience}`}
          icon={{ node: <Gauge />, tone: "brand" }}
          action={
            <span className="rounded-full bg-mint-50 px-2.5 py-0.5 text-[12.5px] font-semibold text-mint-700">Current plan</span>
          }
        />
        <div className="grid gap-5 px-5 pb-6 pt-5 sm:grid-cols-2 sm:px-6">
          {limitKeys.map((key) => (
            <PlanUsageMeter key={key} label={usageLabels[key]} used={usage[key]} limit={currentPlan.limits[key]} />
          ))}
        </div>
      </Card>

      <section aria-labelledby="upgrade-heading" className="space-y-4">
        <div>
          <h3 id="upgrade-heading" className="text-[15px] font-semibold text-ink-900">
            Upgrade options
          </h3>
          <p className="mt-0.5 text-[13.5px] text-ink-500">Paid plans open soon. Your data stays exactly where it is when you upgrade.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {upgrades.map((plan) => (
            <PlanOptionCard key={plan.id} plan={plan} recommended={plan.id === "pro"} />
          ))}
        </div>
      </section>
    </div>
  );
}
