import "server-only";

import { cache } from "react";
import { notFound } from "next/navigation";

import { requireOrganizationContext } from "@/server/auth/organization";
import { NotFoundError } from "@/server/errors";
import { getProposal } from "@/server/services/proposal.service";
import { proposalIdSchema } from "@/validators/proposals";

export const loadProposal = cache(async (id: string) => {
  const proposalId = proposalIdSchema.safeParse(id);

  if (!proposalId.success) {
    notFound();
  }

  const ctx = await requireOrganizationContext();

  try {
    return { ctx, proposal: await getProposal(ctx.organization.id, proposalId.data) };
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
});
