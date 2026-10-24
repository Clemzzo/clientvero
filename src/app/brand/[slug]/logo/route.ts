import { z } from "zod";

import { imageResponse, notFoundResponse } from "@/lib/storage/view-response";
import { findLogoKeyBySlug } from "@/server/services/organization.service";

const slugSchema = z.string().min(1).max(80).regex(/^[a-z0-9-]+$/);

export async function GET(_request: Request, ctx: RouteContext<"/brand/[slug]/logo">) {
  const slug = slugSchema.safeParse((await ctx.params).slug);

  if (!slug.success) {
    return notFoundResponse();
  }

  const logoKey = await findLogoKeyBySlug(slug.data);
  return logoKey ? imageResponse(logoKey, "public") : notFoundResponse();
}
