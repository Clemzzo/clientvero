import { withinLimits, workspaceLimits } from "@/lib/redis/rate-limit";
import { requireOrganizationContext } from "@/server/auth/organization";
import { AppError } from "@/server/errors";
import { openNotification } from "@/server/services/notification.service";
import { notificationIdSchema } from "@/validators/notifications";

const noStore = { "Cache-Control": "no-store" };

function redirectTo(path: string, request: Request) {
  return new Response(null, { status: 303, headers: { ...noStore, Location: new URL(path, request.url).toString() } });
}

export async function GET(request: Request, ctx: RouteContext<"/dashboard/notifications/[id]/open">) {
  const notificationId = notificationIdSchema.safeParse((await ctx.params).id);

  if (!notificationId.success) {
    return redirectTo("/dashboard/notifications", request);
  }

  try {
    const context = await requireOrganizationContext();
    const markRead = await withinLimits([workspaceLimits.writesPerUser, context.user.id]);
    return redirectTo(await openNotification(context, notificationId.data, markRead), request);
  } catch (error) {
    if (error instanceof AppError) {
      return redirectTo("/dashboard/notifications", request);
    }
    throw error;
  }
}
