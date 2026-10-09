import "server-only";

import { requireOrganizationContext } from "@/server/auth/organization";
import { permissions, requirePermission } from "@/server/authorization/permissions";
import { listConversations, listProjectOptions } from "@/server/repositories/message.repository";
import { inboxQuerySchema } from "@/validators/messages";

export async function loadInbox(searchParams: Record<string, string | string[] | undefined>) {
  const ctx = await requireOrganizationContext();
  requirePermission(ctx, permissions.projectsRead);
  const query = inboxQuerySchema.parse(searchParams);
  const [result, projects] = await Promise.all([
    listConversations(ctx.organization.id, query),
    listProjectOptions(ctx.organization.id),
  ]);

  return { ctx, query, result, projects };
}
