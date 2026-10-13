"use server";

import { revalidatePath } from "next/cache";

import { workspaceLimits } from "@/lib/redis/rate-limit";
import { requireWithinLimit } from "@/server/actions/rate-limit-guard";
import { requireCurrentAccount } from "@/server/auth/current-user";
import { updateUserTimeZone } from "@/server/services/user.service";
import { timeZoneSchema } from "@/validators/account";

export async function saveTimeZoneAction(timeZone: unknown): Promise<void> {
  const parsed = timeZoneSchema.safeParse(timeZone);
  if (!parsed.success) return;

  try {
    const { user } = await requireCurrentAccount();
    if (user.timezone === parsed.data) return;

    await requireWithinLimit({ user }, workspaceLimits.writesPerUser);
    await updateUserTimeZone(user.id, parsed.data);
  } catch (error) {
    console.error("[account] saving time zone failed", error instanceof Error ? error.message : error);
    return;
  }

  revalidatePath("/dashboard", "layout");
}
