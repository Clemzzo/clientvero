import { inlineFileResponse, notFoundResponse } from "@/lib/storage/view-response";
import { requireOrganizationContext } from "@/server/auth/organization";
import { permissions, requirePermission } from "@/server/authorization/permissions";
import { AppError } from "@/server/errors";
import { getFileForDownload } from "@/server/services/file.service";
import { fileIdSchema } from "@/validators/files";

export async function GET(_request: Request, ctx: RouteContext<"/dashboard/files/[id]/view">) {
  const fileId = fileIdSchema.safeParse((await ctx.params).id);

  if (!fileId.success) {
    return notFoundResponse();
  }

  try {
    const context = await requireOrganizationContext();
    requirePermission(context, permissions.projectsRead);
    const file = await getFileForDownload(context.organization.id, fileId.data);
    return await inlineFileResponse(file);
  } catch (error) {
    if (error instanceof AppError) {
      return notFoundResponse();
    }
    throw error;
  }
}
