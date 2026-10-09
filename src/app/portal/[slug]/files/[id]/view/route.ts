import { inlineFileResponse, notFoundResponse } from "@/lib/storage/view-response";
import { requirePortalContext } from "@/server/auth/portal-session";
import { findPortalFileObject } from "@/server/repositories/file.repository";
import { fileIdSchema } from "@/validators/files";

export async function GET(_request: Request, ctx: RouteContext<"/portal/[slug]/files/[id]/view">) {
  const { slug, id } = await ctx.params;
  const context = await requirePortalContext(slug);
  const fileId = fileIdSchema.safeParse(id);
  const file = fileId.success ? await findPortalFileObject(context, fileId.data) : null;

  return file ? inlineFileResponse(file) : notFoundResponse();
}
