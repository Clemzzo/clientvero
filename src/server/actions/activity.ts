"use server";

import { revalidatePath } from "next/cache";

import { workspaceLimits } from "@/lib/redis/rate-limit";
import { toActionError } from "@/server/actions/action-error";
import { requireWithinLimit } from "@/server/actions/rate-limit-guard";
import { requireOrganizationContext } from "@/server/auth/organization";
import { permissions, requirePermission } from "@/server/authorization/permissions";
import { clearActivity, deleteActivityEntry } from "@/server/services/activity.service";
import { activityIdSchema } from "@/validators/activity";

const entryMissing = "This activity entry no longer exists.";
const errorOptions = { scope: "activity", notFound: entryMissing };

async function requireActivityManager() {
  const ctx = await requireOrganizationContext();
  requirePermission(ctx, permissions.activityDelete);
  await requireWithinLimit(ctx, workspaceLimits.writesPerUser);
  return ctx;
}

export async function deleteActivityEntryAction(id: string): Promise<{ error?: string }> {
  const entryId = activityIdSchema.safeParse(id);

  if (!entryId.success) {
    return { error: entryMissing };
  }

  try {
    const ctx = await requireActivityManager();
    await deleteActivityEntry(ctx, entryId.data);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidatePath("/dashboard", "layout");
  return {};
}

export async function clearActivityAction(): Promise<{ error?: string; removed?: number }> {
  let removed: number;

  try {
    const ctx = await requireActivityManager();
    removed = await clearActivity(ctx);
  } catch (error) {
    return { error: toActionError(error, errorOptions) };
  }

  revalidatePath("/dashboard", "layout");
  return { removed };
}
