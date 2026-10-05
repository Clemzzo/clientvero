import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Users } from "lucide-react";

import { ProjectForm } from "@/components/projects/ProjectForm";
import { BackLink } from "@/components/shared/BackLink";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { newProjectValues, projectValuesFromProposal } from "@/features/projects/project-form-values";
import { createProjectAction } from "@/server/actions/projects";
import { requireOrganizationContext } from "@/server/auth/organization";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { NotFoundError } from "@/server/errors";
import { findProjectIdForProposal } from "@/server/repositories/project.repository";
import { listClientOptions } from "@/server/repositories/proposal.repository";
import { getProposal } from "@/server/services/proposal.service";
import { clientIdSchema } from "@/validators/clients";
import { proposalIdSchema } from "@/validators/proposals";

export const metadata: Metadata = {
  title: "New project",
};

function PageShell({ description, children }: { description: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 lg:py-10">
      <BackLink href="/dashboard/projects">Projects</BackLink>
      <div className="mt-4">
        <PageHeader title="New project" description={description} />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}

async function loadAcceptedProposal(organizationId: string, proposalId: string) {
  try {
    return await getProposal(organizationId, proposalId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
}

export default async function NewProjectPage(props: PageProps<"/dashboard/projects/new">) {
  const { organization, membership } = await requireOrganizationContext();

  if (!hasPermission(membership.role, permissions.projectsCreate)) {
    notFound();
  }

  const searchParams = await props.searchParams;
  const proposalId = proposalIdSchema.safeParse(searchParams.proposalId);

  if (proposalId.success) {
    const proposal = await loadAcceptedProposal(organization.id, proposalId.data);
    const existingProjectId = await findProjectIdForProposal(organization.id, proposal.id);

    if (existingProjectId) redirect(`/dashboard/projects/${existingProjectId}`);
    if (proposal.status !== "ACCEPTED") redirect(`/dashboard/proposals/${proposal.id}`);

    return (
      <PageShell description="Prefilled from the accepted proposal. Add dates, then save.">
        <ProjectForm
          action={createProjectAction}
          values={projectValuesFromProposal(proposal)}
          client={{ kind: "fixed", name: proposal.clientName, hint: "From the accepted proposal." }}
          cancelHref={`/dashboard/proposals/${proposal.id}`}
          submitLabel="Create project"
        />
      </PageShell>
    );
  }

  const clients = await listClientOptions(organization.id);

  if (clients.length === 0) {
    return (
      <PageShell description="Projects belong to a client.">
        <Card>
          <EmptyState
            icon={<Users />}
            title="Add a client first"
            description="Every project belongs to a client. Add one, or convert a won lead."
            action={
              <Button asChild className="rounded-lg">
                <Link href="/dashboard/clients/new">Add a client</Link>
              </Button>
            }
            className="py-16"
          />
        </Card>
      </PageShell>
    );
  }

  const requestedClient = clientIdSchema.safeParse(searchParams.clientId);
  const clientId =
    requestedClient.success && clients.some((client) => client.value === requestedClient.data) ? requestedClient.data : "";

  return (
    <PageShell description="Only the client and name are required. Add milestones after saving.">
      <ProjectForm
        action={createProjectAction}
        values={newProjectValues(organization.currency, clientId)}
        client={{ kind: "select", options: clients }}
        cancelHref="/dashboard/projects"
        submitLabel="Create project"
      />
    </PageShell>
  );
}
