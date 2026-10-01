import "server-only";

import { cache } from "react";
import { notFound } from "next/navigation";

import { requireOrganizationContext } from "@/server/auth/organization";
import { NotFoundError } from "@/server/errors";
import { getClient } from "@/server/services/client.service";
import { clientIdSchema } from "@/validators/clients";

export const loadClient = cache(async (id: string) => {
  const clientId = clientIdSchema.safeParse(id);

  if (!clientId.success) {
    notFound();
  }

  const ctx = await requireOrganizationContext();

  try {
    return { ctx, client: await getClient(ctx.organization.id, clientId.data) };
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
});
