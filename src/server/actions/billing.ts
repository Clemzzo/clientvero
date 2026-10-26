"use server";

import { revalidatePath } from "next/cache";

import { workspaceLimits } from "@/lib/redis/rate-limit";
import { toActionError } from "@/server/actions/action-error";
import { requireWithinLimit } from "@/server/actions/rate-limit-guard";
import { requireOrganizationContext } from "@/server/auth/organization";
import { permissions, requirePermission } from "@/server/authorization/permissions";
import {
  cancelSubscription,
  changePlan,
  createBillingPortalUrl,
  startCheckout,
} from "@/server/services/subscription.service";
import { paidPlanIdSchema } from "@/validators/billing";

type ActionResult = { error?: string };
type RedirectResult = { error: string } | { url: string };

const billingPath = "/dashboard/settings/billing";
const errorOptions = { scope: "billing", notFound: "We couldn't find your workspace." };
const unknownPlan = "Choose Pro or Agency.";

async function requireBillingManager() {
  const ctx = await requireOrganizationContext();
  requirePermission(ctx, permissions.billingManage);
  await requireWithinLimit(ctx, workspaceLimits.writesPerUser);
  return ctx;
}

export async function startCheckoutAction(planId: string): Promise<RedirectResult> {
  try {
    const ctx = await requireBillingManager();
    const plan = paidPlanIdSchema.safeParse(planId);
    if (!plan.success) return { error: unknownPlan };

    return { url: await startCheckout(ctx, plan.data) };
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }
}

export async function changePlanAction(planId: string): Promise<ActionResult> {
  try {
    const ctx = await requireBillingManager();
    const plan = paidPlanIdSchema.safeParse(planId);
    if (!plan.success) return { error: unknownPlan };

    await changePlan(ctx, plan.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidatePath(billingPath);
  return {};
}

export async function cancelSubscriptionAction(): Promise<ActionResult> {
  try {
    const ctx = await requireBillingManager();
    await cancelSubscription(ctx);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidatePath(billingPath);
  return {};
}

export async function openBillingPortalAction(): Promise<RedirectResult> {
  try {
    const ctx = await requireBillingManager();
    return { url: await createBillingPortalUrl(ctx) };
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }
}
