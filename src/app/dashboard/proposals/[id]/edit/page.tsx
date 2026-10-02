import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ProposalBuilder } from "@/components/proposals/ProposalBuilder";
import { BackLink } from "@/components/shared/BackLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { editProposalValues } from "@/features/proposals/builder-values";
import { isEditable } from "@/features/proposals/proposal-status";
import { updateProposalAction } from "@/server/actions/proposals";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { listClientOptions } from "@/server/repositories/proposal.repository";

import { loadProposal } from "../load-proposal";

export async function generateMetadata(props: PageProps<"/dashboard/proposals/[id]/edit">): Promise<Metadata> {
  const { proposal } = await loadProposal((await props.params).id);
  return { title: `Edit ${proposal.title}` };
}

export default async function EditProposalPage(props: PageProps<"/dashboard/proposals/[id]/edit">) {
  const { ctx, proposal } = await loadProposal((await props.params).id);
  const detailHref = `/dashboard/proposals/${proposal.id}`;

  if (!hasPermission(ctx.membership.role, permissions.proposalsCreate)) {
    notFound();
  }

  if (!isEditable(proposal.status)) {
    redirect(detailHref);
  }

  const clients = await listClientOptions(ctx.organization.id);

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <BackLink href={detailHref}>{proposal.title}</BackLink>
      <div className="mt-4">
        <PageHeader title="Edit proposal" />
      </div>
      <div className="mt-8">
        <ProposalBuilder
          action={updateProposalAction.bind(null, proposal.id)}
          clients={clients}
          values={editProposalValues(proposal)}
          cancelHref={detailHref}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
