import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { subscriptions, type Subscription } from "@/db/schema";

export const getSubscription = cache(async (organizationId: string): Promise<Subscription | null> => {
  const [row] = await db.select().from(subscriptions).where(eq(subscriptions.organizationId, organizationId)).limit(1);
  return row ?? null;
});

export async function findSubscriptionByBachsId(bachsSubscriptionId: string): Promise<Subscription | null> {
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.bachsSubscriptionId, bachsSubscriptionId))
    .limit(1);
  return row ?? null;
}
