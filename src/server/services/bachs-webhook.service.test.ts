import { createHmac, randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { db } from "@/db";
import { activityLogs, subscriptions, webhookEvents, type Organization } from "@/db/schema";
import { activityActions } from "@/features/activity/activity-actions";
import { handleBachsWebhook } from "@/server/services/bachs-webhook.service";
import { getWorkspacePlan } from "@/server/services/subscription.service";
import { cleanup, createTestOrganization } from "@/test/fixtures";

const secret = "whsec_test_secret";
const products = { pro: "prod_test_pro_plan", agency: "prod_test_agency_plan" };

function sign(body: string, timestamp = Math.floor(Date.now() / 1000)) {
  const signature = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  return { "x-bachs-timestamp": String(timestamp), "x-bachs-signature-v2": `t=${timestamp},v1=${signature}` };
}

type EventOptions = {
  type?: string;
  createdAt: string;
  subscriptionId: string;
  status?: string;
  productId?: string;
  cancelAtPeriodEnd?: boolean;
  organizationId?: string;
};

function eventBody(options: EventOptions) {
  return JSON.stringify({
    id: `evt_${randomUUID()}`,
    type: options.type ?? "customer.subscription.updated",
    created_at: options.createdAt,
    organization_id: "acct_test",
    data: {
      subscription_id: options.subscriptionId,
      customer: { customer_id: "cust_test_1", email: "owner@example.com", name: "Owner" },
      product_id: options.productId ?? products.pro,
      status: options.status ?? "active",
      current_period_start: "2026-10-01T00:00:00Z",
      current_period_end: "2026-11-01T00:00:00Z",
      cancel_at_period_end: options.cancelAtPeriodEnd ?? false,
      canceled_at: null,
      metadata: options.organizationId ? { organization_id: options.organizationId } : {},
    },
  });
}

function deliver(body: string, headers = sign(body)) {
  return handleBachsWebhook(body, headers);
}

async function subscriptionActivity(organizationId: string) {
  const rows = await db
    .select({ action: activityLogs.action })
    .from(activityLogs)
    .where(and(eq(activityLogs.organizationId, organizationId), eq(activityLogs.resourceType, "ORGANIZATION")))
    .orderBy(activityLogs.createdAt);
  return rows.map((row) => row.action);
}

describe("Bachs webhooks", () => {
  let orgA: Organization;
  let orgB: Organization;
  const subA = `sub_test_${randomUUID()}`;
  const subB = `sub_test_${randomUUID()}`;
  const eventIds: string[] = [];

  async function deliverTracked(body: string) {
    eventIds.push(JSON.parse(body).id);
    return deliver(body);
  }

  beforeAll(async () => {
    vi.stubEnv("BACHS_API_KEY", "sk_sandbox_test");
    vi.stubEnv("BACHS_WEBHOOK_SECRET", secret);
    vi.stubEnv("BACHS_PRODUCT_PRO", products.pro);
    vi.stubEnv("BACHS_PRODUCT_AGENCY", products.agency);
    [orgA, orgB] = await Promise.all([
      createTestOrganization("USD", { plan: "free" }),
      createTestOrganization("USD", { plan: "free" }),
    ]);
  });

  afterAll(async () => {
    vi.unstubAllEnvs();
    for (const eventId of eventIds) {
      await db.delete(webhookEvents).where(eq(webhookEvents.eventId, eventId));
    }
    await cleanup({ organizationIds: [orgA.id, orgB.id], userIds: [] });
  });

  it("rejects a delivery with a bad signature and stores nothing", async () => {
    const body = eventBody({ createdAt: "2026-10-26T10:00:00Z", subscriptionId: subA, organizationId: orgA.id });
    const result = await deliver(body, sign(`${body} `));
    expect(result.status).toBe(400);

    const [stored] = await db.select().from(webhookEvents).where(eq(webhookEvents.eventId, JSON.parse(body).id));
    expect(stored).toBeUndefined();
  });

  it("starts the plan from a verified created event, once", async () => {
    const body = eventBody({
      type: "customer.subscription.created",
      createdAt: "2026-10-26T10:00:00.000001Z",
      subscriptionId: subA,
      organizationId: orgA.id,
    });

    expect(await deliverTracked(body)).toEqual({ status: 200, body: "applied" });
    expect(await deliver(body)).toEqual({ status: 200, body: "duplicate" });

    const { plan, subscription } = await getWorkspacePlan(orgA.id);
    expect(plan.id).toBe("pro");
    expect(subscription?.bachsCustomerId).toBe("cust_test_1");
    expect(await subscriptionActivity(orgA.id)).toEqual([activityActions.subscriptionStarted]);
  });

  it("ignores an older event that arrives after a newer one", async () => {
    await deliverTracked(
      eventBody({ createdAt: "2026-10-26T12:00:00Z", subscriptionId: subA, productId: products.agency }),
    );
    await deliverTracked(eventBody({ createdAt: "2026-10-26T11:00:00Z", subscriptionId: subA, status: "past_due" }));

    const { plan, subscription } = await getWorkspacePlan(orgA.id);
    expect(plan.id).toBe("agency");
    expect(subscription?.status).toBe("ACTIVE");
    expect(await subscriptionActivity(orgA.id)).toEqual([
      activityActions.subscriptionStarted,
      activityActions.subscriptionPlanChanged,
    ]);
  });

  it("drops the workspace to Free while a renewal is past due", async () => {
    await deliverTracked(eventBody({ createdAt: "2026-10-26T13:00:00Z", subscriptionId: subA, productId: products.agency, status: "past_due" }));

    const { plan, subscription } = await getWorkspacePlan(orgA.id);
    expect(subscription?.status).toBe("PAST_DUE");
    expect(plan.id).toBe("free");
  });

  it("never lets metadata point an existing subscription at another workspace", async () => {
    await deliverTracked(
      eventBody({ createdAt: "2026-10-26T14:00:00Z", subscriptionId: subA, productId: products.agency, organizationId: orgB.id }),
    );

    const [rowB] = await db.select().from(subscriptions).where(eq(subscriptions.organizationId, orgB.id));
    expect(rowB).toBeUndefined();
    expect((await getWorkspacePlan(orgA.id)).plan.id).toBe("agency");
  });

  it("records events it can't link to a workspace as failed", async () => {
    const unknownOrg = eventBody({
      type: "customer.subscription.created",
      createdAt: "2026-10-26T15:00:00Z",
      subscriptionId: subB,
      organizationId: randomUUID(),
    });
    const unknownProduct = eventBody({
      type: "customer.subscription.created",
      createdAt: "2026-10-26T15:00:01Z",
      subscriptionId: subB,
      organizationId: orgB.id,
      productId: "prod_someone_else",
    });

    for (const body of [unknownOrg, unknownProduct]) {
      expect((await deliverTracked(body)).status).toBe(200);
      const [stored] = await db.select().from(webhookEvents).where(eq(webhookEvents.eventId, JSON.parse(body).id));
      expect(stored.failedAt).not.toBeNull();
      expect(stored.processedAt).toBeNull();
    }

    expect((await getWorkspacePlan(orgB.id)).subscription).toBeNull();
  });

  it("logs the scheduled cancellation and the end of the plan", async () => {
    await deliverTracked(
      eventBody({ createdAt: "2026-10-26T16:00:00Z", subscriptionId: subA, productId: products.agency, cancelAtPeriodEnd: true }),
    );
    await deliverTracked(
      eventBody({
        type: "customer.subscription.deleted",
        createdAt: "2026-10-26T17:00:00Z",
        subscriptionId: subA,
        productId: products.agency,
        status: "canceled",
        cancelAtPeriodEnd: true,
      }),
    );

    expect((await getWorkspacePlan(orgA.id)).plan.id).toBe("free");
    expect(await subscriptionActivity(orgA.id)).toEqual([
      activityActions.subscriptionStarted,
      activityActions.subscriptionPlanChanged,
      activityActions.subscriptionStatusChanged,
      activityActions.subscriptionStatusChanged,
      activityActions.subscriptionCancelScheduled,
      activityActions.subscriptionEnded,
    ]);
  });
});
