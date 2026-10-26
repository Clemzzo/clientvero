import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gauge } from "lucide-react";

import { CheckoutActivating } from "@/components/settings/CheckoutActivating";
import { PlanActionButton } from "@/components/settings/PlanActionButton";
import { PlanOptionCard } from "@/components/settings/PlanOptionCard";
import { PlanUsageMeter } from "@/components/settings/PlanUsageMeter";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SubscriptionControls } from "@/components/settings/SubscriptionControls";
import { FormAlert } from "@/components/shared/FormAlert";
import { Card, CardHeader } from "@/components/ui/card";
import type { Subscription } from "@/db/schema";
import { formatPlanPrice, getPlan, plans, type PlanLimits } from "@/features/subscriptions/plans";
import { formatDate } from "@/lib/utils/format";
import { resolveTimeZone, todayInTimeZone } from "@/lib/utils/timezone";
import { requireOrganizationContext } from "@/server/auth/organization";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { getPlanUsage } from "@/server/repositories/plan-usage.repository";
import { getWorkspacePlan } from "@/server/services/subscription.service";

export const metadata: Metadata = {
  title: "Billing",
};

const usageLabels: Record<keyof PlanLimits, string> = {
  clients: "Clients",
  activeProjects: "Active projects",
  proposalsPerMonth: "Proposals this month",
  invoicesPerMonth: "Invoices this month",
};

function subscriptionNote(subscription: Subscription, periodEnd: string | null) {
  const planName = getPlan(subscription.plan).name;

  switch (subscription.status) {
    case "ACTIVE":
    case "TRIALING":
      if (!periodEnd) return null;
      return subscription.cancelAtPeriodEnd
        ? { tone: "info" as const, text: `${planName} ends on ${periodEnd}. After that the workspace moves to Free.` }
        : { tone: "info" as const, text: `Renews on ${periodEnd}.` };
    case "PAST_DUE":
    case "UNPAID":
      return {
        tone: "error" as const,
        text: `Your last ${planName} payment failed, so the workspace is on the Free plan for now. Update your card to get ${planName} back.`,
      };
    case "PAUSED":
      return { tone: "error" as const, text: `Your ${planName} subscription is paused, so the workspace is on the Free plan.` };
    default:
      return null;
  }
}

export default async function BillingSettingsPage(props: PageProps<"/dashboard/settings/billing">) {
  const ctx = await requireOrganizationContext();

  if (!hasPermission(ctx.membership.role, permissions.billingRead)) {
    notFound();
  }

  const timeZone = resolveTimeZone(ctx.user.timezone);
  const [{ plan: currentPlan, subscription }, usage, searchParams] = await Promise.all([
    getWorkspacePlan(ctx.organization.id),
    getPlanUsage(ctx.organization.id, timeZone),
    props.searchParams,
  ]);

  const canManage = hasPermission(ctx.membership.role, permissions.billingManage);
  const live = subscription !== null && subscription.status !== "CANCELLED";
  const switchable = live && subscription.status === "ACTIVE" && !subscription.cancelAtPeriodEnd;
  const periodEnd = subscription?.currentPeriodEnd ? formatDate(todayInTimeZone(timeZone, subscription.currentPeriodEnd)) : null;
  const note = live ? subscriptionNote(subscription, periodEnd) : null;
  const paymentFailed = live && (subscription.status === "PAST_DUE" || subscription.status === "UNPAID");
  const activating = searchParams.checkout === "success" && !live;

  const paidPlans = plans.filter((plan) => plan.id !== "free");
  const otherPlans = switchable ? paidPlans.filter((plan) => plan.id !== subscription.plan) : live ? [] : paidPlans;
  const limitKeys = Object.keys(usageLabels) as (keyof PlanLimits)[];

  return (
    <div className="space-y-6">
      <SettingsHeader title="Billing" description="Your ClientVero plan and how much of it you're using." />

      {activating && <CheckoutActivating />}

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
        {live && (
          <div className="space-y-4 border-t border-ink-100 px-5 py-5 sm:px-6">
            {note &&
              (note.tone === "error" ? (
                <FormAlert tone="error">{note.text}</FormAlert>
              ) : (
                <p className="text-[13.5px] text-ink-700">{note.text}</p>
              ))}
            {canManage && (
              <SubscriptionControls
                planName={getPlan(subscription.plan).name}
                periodEnd={periodEnd}
                canCancel={switchable}
                portalLabel={paymentFailed ? "Update card" : undefined}
              />
            )}
          </div>
        )}
      </Card>

      {otherPlans.length > 0 && (
        <section aria-labelledby="upgrade-heading" className="space-y-4">
          <div>
            <h3 id="upgrade-heading" className="text-[15px] font-semibold text-ink-900">
              {switchable ? "Switch plan" : "Upgrade options"}
            </h3>
            <p className="mt-0.5 text-[13.5px] text-ink-500">
              {canManage
                ? "Prices are in USD and billed monthly by card. Your data stays exactly where it is when you change plans."
                : "Only owners and admins can change the plan."}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {otherPlans.map((plan) => (
              <PlanOptionCard
                key={plan.id}
                plan={plan}
                recommended={plan.id === "pro" && !switchable}
                action={
                  canManage ? (
                    <PlanActionButton
                      mode={switchable ? "switch" : "upgrade"}
                      planId={plan.id}
                      planName={plan.name}
                      price={formatPlanPrice(plan)}
                      recommended={plan.id === "pro" && !switchable}
                    />
                  ) : null
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
