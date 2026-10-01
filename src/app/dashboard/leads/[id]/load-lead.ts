import "server-only";

import { cache } from "react";
import { notFound } from "next/navigation";

import { requireOrganizationContext } from "@/server/auth/organization";
import { NotFoundError } from "@/server/errors";
import { getLead } from "@/server/services/lead.service";
import { leadIdSchema } from "@/validators/leads";

export const loadLead = cache(async (id: string) => {
  const leadId = leadIdSchema.safeParse(id);

  if (!leadId.success) {
    notFound();
  }

  const ctx = await requireOrganizationContext();

  try {
    return { ctx, lead: await getLead(ctx.organization.id, leadId.data) };
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
});
