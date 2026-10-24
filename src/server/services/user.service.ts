import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import type { ProfileInput } from "@/validators/settings";

export async function updateUserTimeZone(userId: string, timeZone: string): Promise<void> {
  await db.update(users).set({ timezone: timeZone }).where(eq(users.id, userId));
}

export async function updateProfile(userId: string, input: ProfileInput): Promise<void> {
  await db.update(users).set({ firstName: input.firstName, lastName: input.lastName }).where(eq(users.id, userId));
}

export async function setAvatarKey(userId: string, avatarKey: string | null): Promise<void> {
  await db.update(users).set({ avatarKey }).where(eq(users.id, userId));
}
