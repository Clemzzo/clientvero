import { imageResponse, notFoundResponse } from "@/lib/storage/view-response";
import { requireOrganizationContext } from "@/server/auth/organization";
import { AppError } from "@/server/errors";
import { findMemberAvatarKey } from "@/server/repositories/team.repository";
import { recordIdSchema } from "@/validators/settings";

export async function GET(_request: Request, ctx: RouteContext<"/dashboard/team/[userId]/avatar">) {
  const userId = recordIdSchema.safeParse((await ctx.params).userId);

  if (!userId.success) {
    return notFoundResponse();
  }

  try {
    const context = await requireOrganizationContext();
    const avatarKey = await findMemberAvatarKey(context.organization.id, userId.data);
    return avatarKey ? await imageResponse(avatarKey, "private") : notFoundResponse();
  } catch (error) {
    if (error instanceof AppError) {
      return notFoundResponse();
    }
    throw error;
  }
}
