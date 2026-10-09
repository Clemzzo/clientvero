import { createDownloadUrl } from "@/lib/storage/client";
import { requireOrganizationContext } from "@/server/auth/organization";
import { permissions, requirePermission } from "@/server/authorization/permissions";
import { AppError } from "@/server/errors";
import { getFileForDownload } from "@/server/services/file.service";
import { fileIdSchema } from "@/validators/files";

const noStore = { "Cache-Control": "no-store" };

export async function GET(_request: Request, ctx: RouteContext<"/dashboard/files/[id]/download">) {
  const fileId = fileIdSchema.safeParse((await ctx.params).id);

  if (!fileId.success) {
    return new Response("Not found", { status: 404, headers: noStore });
  }

  try {
    const context = await requireOrganizationContext();
    requirePermission(context, permissions.projectsRead);
    const file = await getFileForDownload(context.organization.id, fileId.data);
    const url = await createDownloadUrl(file.objectKey);
    return new Response(null, { status: 302, headers: { ...noStore, Location: url } });
  } catch (error) {
    if (error instanceof AppError) {
      return new Response("Not found", { status: 404, headers: noStore });
    }
    throw error;
  }
}
