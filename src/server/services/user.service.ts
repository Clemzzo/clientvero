import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

export async function updateUserTimeZone(userId: string, timeZone: string): Promise<void> {
  await db.update(users).set({ timezone: timeZone }).where(eq(users.id, userId));
}
