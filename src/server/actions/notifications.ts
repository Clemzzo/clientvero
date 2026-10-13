"use server";

import { revalidatePath } from "next/cache";

import { withinLimits, workspaceLimits } from "@/lib/redis/rate-limit";
import { toActionError } from "@/server/actions/action-error";
import { requireWithinLimit } from "@/server/actions/rate-limit-guard";
import { requireOrganizationContext } from "@/server/auth/organization";
import { markAllNotificationsRead } from "@/server/services/notification.service";
import { getShellSummary, type ShellSummary } from "@/server/services/shell-summary.service";

export async function markAllNotificationsReadAction(): Promise<{ error?: string; marked?: number }> {
  let marked: number;

  try {
    const ctx = await requireOrganizationContext();
    await requireWithinLimit(ctx, workspaceLimits.writesPerUser);
    marked = await markAllNotificationsRead(ctx);
  } catch (error) {
    return { error: toActionError(error, { scope: "notifications", notFound: "These notifications no longer exist." }) };
  }

  revalidatePath("/dashboard", "layout");
  return { marked };
}

export async function pollShellSummaryAction(): Promise<ShellSummary | null> {
  try {
    const ctx = await requireOrganizationContext();
    if (!(await withinLimits([workspaceLimits.messagePollsPerUser, ctx.user.id]))) {
      return null;
    }

    return await getShellSummary(ctx);
  } catch {
    return null;
  }
}
