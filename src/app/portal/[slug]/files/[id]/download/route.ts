import { createDownloadUrl } from "@/lib/storage/client";
import { requirePortalContext } from "@/server/auth/portal-session";
import { findPortalFileObject } from "@/server/repositories/file.repository";
import { fileIdSchema } from "@/validators/files";

const noStore = { "Cache-Control": "no-store" };

export async function GET(_request: Request, ctx: RouteContext<"/portal/[slug]/files/[id]/download">) {
  const { slug, id } = await ctx.params;
  const context = await requirePortalContext(slug);
  const fileId = fileIdSchema.safeParse(id);
  const file = fileId.success ? await findPortalFileObject(context, fileId.data) : null;

  if (!file) {
    return new Response("Not found", { status: 404, headers: noStore });
  }

  const url = await createDownloadUrl(file.objectKey);
  return new Response(null, { status: 302, headers: { ...noStore, Location: url } });
}
