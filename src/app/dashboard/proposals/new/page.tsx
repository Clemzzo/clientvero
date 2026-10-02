import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProposalBuilder } from "@/components/proposals/ProposalBuilder";
import { BackLink } from "@/components/shared/BackLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { newProposalValues } from "@/features/proposals/builder-values";
import { createProposalAction } from "@/server/actions/proposals";
import { requireOrganizationContext } from "@/server/auth/organization";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { listClientOptions } from "@/server/repositories/proposal.repository";
import { clientIdSchema } from "@/validators/clients";

export const metadata: Metadata = {
  title: "New proposal",
};

export default async function NewProposalPage(props: PageProps<"/dashboard/proposals/new">) {
  const { organization, membership } = await requireOrganizationContext();

  if (!hasPermission(membership.role, permissions.proposalsCreate)) {
    notFound();
  }

  const clients = await listClientOptions(organization.id);
  const requestedClient = clientIdSchema.safeParse((await props.searchParams).clientId);
  const clientId = requestedClient.success && clients.some((client) => client.value === requestedClient.data) ? requestedClient.data : "";

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <BackLink href="/dashboard/proposals">Proposals</BackLink>
      <div className="mt-4">
        <PageHeader title="New proposal" description="Saved as a draft. You can preview it before sending." />
      </div>
      <div className="mt-8">
        <ProposalBuilder
          action={createProposalAction}
          clients={clients}
          values={newProposalValues(organization.currency, clientId)}
          cancelHref="/dashboard/proposals"
          submitLabel="Save draft"
        />
      </div>
    </div>
  );
}
