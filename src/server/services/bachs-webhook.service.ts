import "server-only";

import { BachsWebhookError, webhooks, type WebhookHeaders } from "@bachs/sdk";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { webhookEvents } from "@/db/schema";
import { bachsConfig } from "@/lib/bachs/config";
import {
  BACHS_PROVIDER,
  processSubscriptionEvent,
  recordEventFailure,
} from "@/server/services/subscription.service";
import { bachsEventEnvelopeSchema, bachsSubscriptionEventSchema, subscriptionEventTypes } from "@/validators/billing";

export type WebhookResult = { status: 200 | 400 | 500; body: string };

const subscriptionTypes: readonly string[] = subscriptionEventTypes;

function verify(rawBody: string, headers: WebhookHeaders): Record<string, unknown> | null {
  try {
    return webhooks.constructEvent(rawBody, headers, bachsConfig().webhookSecret);
  } catch (error) {
    if (error instanceof BachsWebhookError) return null;
    throw error;
  }
}

export async function handleBachsWebhook(rawBody: string, headers: WebhookHeaders): Promise<WebhookResult> {
  const verified = verify(rawBody, headers);
  if (!verified) return { status: 400, body: "invalid signature" };

  const envelope = bachsEventEnvelopeSchema.safeParse(verified);
  if (!envelope.success) return { status: 400, body: "invalid event" };

  const { id: eventId, type } = envelope.data;

  await db
    .insert(webhookEvents)
    .values({ provider: BACHS_PROVIDER, eventId, eventType: type, payload: verified })
    .onConflictDoNothing({ target: webhookEvents.eventId });

  const [stored] = await db
    .select({ processedAt: webhookEvents.processedAt })
    .from(webhookEvents)
    .where(eq(webhookEvents.eventId, eventId))
    .limit(1);

  if (stored?.processedAt) return { status: 200, body: "duplicate" };

  if (!subscriptionTypes.includes(type)) {
    await db.update(webhookEvents).set({ processedAt: new Date() }).where(eq(webhookEvents.eventId, eventId));
    return { status: 200, body: "ignored" };
  }

  const event = bachsSubscriptionEventSchema.safeParse(verified);
  if (!event.success) {
    await recordEventFailure(eventId, "Subscription payload did not match the expected shape");
    return { status: 200, body: "unprocessable" };
  }

  const outcome = await processSubscriptionEvent(event.data);

  if (outcome.result === "failed") {
    console.error(`[billing] webhook ${eventId} (${type}) not applied: ${outcome.reason}`);
    await recordEventFailure(eventId, outcome.reason);
  }

  return { status: 200, body: outcome.result };
}
