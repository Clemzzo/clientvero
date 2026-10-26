import "server-only";

import { BachsError } from "@bachs/sdk";
import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { organizations, subscriptions, webhookEvents, type Subscription, type SubscriptionStatus } from "@/db/schema";
import { activityActions, activityActorTypes, activityResources, type ActivityAction } from "@/features/activity/activity-actions";
import { getPlan, type Plan } from "@/features/subscriptions/plans";
import { hasPaidAccess } from "@/features/subscriptions/subscription-status";
import { bachsClient, changeSubscriptionProduct } from "@/lib/bachs/client";
import { BachsNotConfiguredError, bachsConfig, planForProduct, type PaidPlanId } from "@/lib/bachs/config";
import { billingSettingsUrl } from "@/lib/utils/public-url";
import type { OrganizationContext } from "@/server/auth/organization";
import { ConflictError, ExternalServiceError, ValidationError } from "@/server/errors";
import { findSubscriptionByBachsId, getSubscription } from "@/server/repositories/subscription.repository";
import { activityInsertIf } from "@/server/services/activity.service";
import type { BachsSubscriptionEvent } from "@/validators/billing";

export const BACHS_PROVIDER = "BACHS";

export type WorkspacePlan = {
  plan: Plan;
  subscription: Subscription | null;
};

export async function getWorkspacePlan(organizationId: string): Promise<WorkspacePlan> {
  const subscription = await getSubscription(organizationId);
  const paid = subscription && hasPaidAccess(subscription.status);
  return { plan: getPlan(paid ? subscription.plan : "free"), subscription };
}

function isLive(subscription: Subscription | null): boolean {
  return subscription !== null && subscription.status !== "CANCELLED";
}

async function callBachs<T>(operation: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof BachsNotConfiguredError) {
      console.error(`[billing] ${operation}: ${error.message}`);
      throw new ExternalServiceError("Billing isn't set up yet. Please try again later.");
    }
    if (error instanceof BachsError) {
      const code = "errorCode" in error ? String(error.errorCode ?? "") : "";
      const status = "statusCode" in error ? String(error.statusCode) : "";
      console.error(`[billing] ${operation} failed`, error.name, status, code);
      throw new ExternalServiceError();
    }
    throw error;
  }
}

function customerName(ctx: OrganizationContext) {
  return [ctx.user.firstName, ctx.user.lastName].filter(Boolean).join(" ") || ctx.organization.name;
}

export async function startCheckout(ctx: OrganizationContext, planId: PaidPlanId): Promise<string> {
  const subscription = await getSubscription(ctx.organization.id);

  if (isLive(subscription)) {
    throw new ConflictError("Your workspace already has a paid plan. Switch plans from the Billing page instead.");
  }

  const checkout = await callBachs("checkout", () =>
    bachsClient().checkoutSessions.create({
      product_cart: [{ product_id: bachsConfig().products[planId], quantity: 1 }],
      customer: subscription
        ? { customer_id: subscription.bachsCustomerId }
        : { email: ctx.user.email, name: customerName(ctx) },
      billing_currency: "USD",
      success_url: billingSettingsUrl("checkout=success"),
      cancel_url: billingSettingsUrl(),
      metadata: { organization_id: ctx.organization.id, plan: planId },
      expires_in_minutes: 60,
    }),
  );

  return checkout.checkout_url;
}

export async function changePlan(ctx: OrganizationContext, planId: PaidPlanId): Promise<void> {
  const subscription = await getSubscription(ctx.organization.id);

  if (!subscription || subscription.status !== "ACTIVE") {
    throw new ValidationError("Only an active paid plan can be switched. Upgrade from the Billing page first.");
  }
  if (subscription.plan === planId) {
    throw new ConflictError(`You're already on the ${getPlan(planId).name} plan.`);
  }
  if (subscription.cancelAtPeriodEnd) {
    throw new ValidationError("This plan is set to end. It can't be switched before it ends.");
  }

  await callBachs("change plan", () =>
    changeSubscriptionProduct(subscription.bachsSubscriptionId, bachsConfig().products[planId]),
  );
}

export async function cancelSubscription(ctx: OrganizationContext): Promise<void> {
  const subscription = await getSubscription(ctx.organization.id);

  if (!subscription || !isLive(subscription)) {
    throw new ValidationError("Your workspace doesn't have a paid plan to cancel.");
  }
  if (subscription.cancelAtPeriodEnd) {
    throw new ConflictError("Your plan is already set to end at the close of this billing period.");
  }

  await callBachs("cancel", () =>
    bachsClient().subscriptions.cancel(subscription.bachsSubscriptionId, {
      cancel_at_period_end: true,
      reason: "Cancelled from ClientVero billing settings",
    }),
  );
}

export async function createBillingPortalUrl(ctx: OrganizationContext): Promise<string> {
  const subscription = await getSubscription(ctx.organization.id);

  if (!subscription) {
    throw new ValidationError("Payment details are available once your workspace has a paid plan.");
  }

  const session = await callBachs("portal", () => bachsClient().customerPortal.createSession(subscription.bachsCustomerId));
  return session.url;
}

export type ProcessOutcome =
  | { result: "applied" }
  | { result: "ignored"; reason: string }
  | { result: "failed"; reason: string };

async function resolveOrganizationId(event: BachsSubscriptionEvent): Promise<{ id: string; current: Subscription | null } | null> {
  const existing = await findSubscriptionByBachsId(event.data.subscription_id);
  if (existing) return { id: existing.organizationId, current: existing };

  const claimed = event.data.metadata?.organization_id;
  if (typeof claimed !== "string" || !/^[0-9a-f-]{36}$/i.test(claimed)) return null;

  const [organization] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.id, claimed))
    .limit(1);
  if (!organization) return null;

  const [current] = await db.select().from(subscriptions).where(eq(subscriptions.organizationId, organization.id)).limit(1);
  return { id: organization.id, current: current ?? null };
}

function activityFor(previous: Subscription | null, next: { plan: PaidPlanId; status: SubscriptionStatus; cancelAtPeriodEnd: boolean }): ActivityAction | null {
  const restarted = !previous || previous.status === "CANCELLED";

  if (next.status === "CANCELLED") return restarted ? null : activityActions.subscriptionEnded;
  if (restarted) return activityActions.subscriptionStarted;
  if (previous.plan !== next.plan) return activityActions.subscriptionPlanChanged;
  if (!previous.cancelAtPeriodEnd && next.cancelAtPeriodEnd) return activityActions.subscriptionCancelScheduled;
  if (previous.status !== next.status) return activityActions.subscriptionStatusChanged;
  return null;
}

function markProcessed(eventId: string) {
  return db
    .update(webhookEvents)
    .set({ processedAt: sql`now()`, failedAt: null, errorMessage: null })
    .where(eq(webhookEvents.eventId, eventId));
}

export async function recordEventFailure(eventId: string, reason: string) {
  await db.update(webhookEvents).set({ failedAt: sql`now()`, errorMessage: reason }).where(eq(webhookEvents.eventId, eventId));
}

export async function processSubscriptionEvent(event: BachsSubscriptionEvent): Promise<ProcessOutcome> {
  const { data } = event;
  const plan = planForProduct(bachsConfig(), data.product_id);

  if (!plan) {
    return { result: "failed", reason: `Unknown Bachs product ${data.product_id}` };
  }

  const organization = await resolveOrganizationId(event);
  if (!organization) {
    return { result: "failed", reason: "The subscription isn't linked to a ClientVero workspace" };
  }

  const { current } = organization;
  if (current && current.bachsSubscriptionId !== data.subscription_id) {
    if (data.status === "CANCELLED") {
      await markProcessed(event.id);
      return { result: "ignored", reason: "An older subscription ended" };
    }
    if (current.status !== "CANCELLED") {
      return { result: "failed", reason: `Workspace already has live subscription ${current.bachsSubscriptionId}` };
    }
  }

  const values = {
    organizationId: organization.id,
    bachsCustomerId: data.customer.customer_id,
    bachsSubscriptionId: data.subscription_id,
    bachsProductId: data.product_id,
    plan,
    status: data.status,
    currentPeriodStart: data.current_period_start ? new Date(data.current_period_start) : null,
    currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
    cancelAtPeriodEnd: data.cancel_at_period_end,
    canceledAt: data.canceled_at ? new Date(data.canceled_at) : null,
    bachsEventAt: sql`${event.created_at}::timestamptz`,
    updatedAt: sql`now()`,
  };
  const { organizationId, ...changes } = values;
  const action = activityFor(current, { plan, status: data.status, cancelAtPeriodEnd: data.cancel_at_period_end });
  const appliedNow = sql`exists (
    select 1 from ${subscriptions}
    where ${subscriptions.organizationId} = ${organizationId}
      and ${subscriptions.bachsSubscriptionId} = ${data.subscription_id}
      and ${subscriptions.updatedAt} = now()
  )`;

  const upsert = db
    .insert(subscriptions)
    .values(values)
    .onConflictDoUpdate({
      target: subscriptions.organizationId,
      set: changes,
      setWhere: sql`${subscriptions.bachsEventAt} < excluded.bachs_event_at`,
    });

  if (action) {
    await db.batch([
      upsert,
      activityInsertIf(
        {
          organizationId,
          actorUserId: null,
          actorType: activityActorTypes.system,
          action,
          resourceType: activityResources.organization,
          resourceId: organizationId,
          metadata: { source: "billing", name: getPlan(plan).name, subscriptionStatus: data.status },
        },
        appliedNow,
      ),
      markProcessed(event.id),
    ]);
  } else {
    await db.batch([upsert, markProcessed(event.id)]);
  }

  return { result: "applied" };
}
