import type { Metadata } from "next";
import Link from "next/link";
import { Activity, Pencil } from "lucide-react";

import { ClientDetails } from "@/components/clients/ClientDetails";
import { ClientFiles } from "@/components/clients/ClientFiles";
import { ClientProjects } from "@/components/clients/ClientProjects";
import { ClientProposals } from "@/components/clients/ClientProposals";
import { DisablePortalButton } from "@/components/clients/DisablePortalButton";
import { ActivityTimeline } from "@/components/shared/ActivityTimeline";
import { BackLink } from "@/components/shared/BackLink";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { TabLinks } from "@/components/shared/TabLinks";
import { UrlNotice } from "@/components/shared/UrlNotice";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import type { Client } from "@/db/schema";
import { activityResources } from "@/features/activity/activity-actions";
import { noticeSchema, type NoticeKey } from "@/features/notices";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { listWorkspaceFiles } from "@/server/repositories/file.repository";
import { listClientProjects } from "@/server/repositories/project.repository";
import { listClientProposals } from "@/server/repositories/proposal.repository";
import { listActivity } from "@/server/services/activity.service";
import { clientTabSchema, type ClientTab } from "@/validators/clients";
import { pageNumber } from "@/validators/fields";

import { loadClient } from "./load-client";

export async function generateMetadata(props: PageProps<"/dashboard/clients/[id]">): Promise<Metadata> {
  const { client } = await loadClient((await props.params).id);
  return { title: client.name };
}

function noticeMessage(notice: NoticeKey | undefined, client: Client) {
  return notice === "lead-converted"
    ? `${client.name} is now a client. Their details were copied from the lead.`
    : `${client.name} was added to your clients.`;
}

export default async function ClientPage(props: PageProps<"/dashboard/clients/[id]">) {
  const { ctx, client } = await loadClient((await props.params).id);
  const searchParams = await props.searchParams;
  const tab = clientTabSchema.parse(searchParams.tab);
  const notice = noticeSchema.parse(searchParams.notice);
  const filesPage = pageNumber.parse(searchParams.page);
  const canEdit = hasPermission(ctx.membership.role, permissions.clientsUpdate);
  const [proposals, projects, files] = await Promise.all([
    listClientProposals(ctx.organization.id, client.id),
    listClientProjects(ctx.organization.id, client.id),
    listWorkspaceFiles(ctx.organization.id, { q: "", page: filesPage }, { clientId: client.id }),
  ]);
  const basePath = `/dashboard/clients/${client.id}`;

  const tabs: { value: ClientTab; label: string; href: string; count?: number }[] = [
    { value: "overview", label: "Overview", href: basePath },
    { value: "proposals", label: "Proposals", href: `${basePath}?tab=proposals`, count: proposals.length },
    { value: "projects", label: "Projects", href: `${basePath}?tab=projects`, count: projects.length },
    { value: "files", label: "Files", href: `${basePath}?tab=files`, count: files.total },
    { value: "activity", label: "Activity", href: `${basePath}?tab=activity` },
  ];

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <UrlNotice notice={notice} message={noticeMessage(notice, client)} />
      <BackLink href="/dashboard/clients">Clients</BackLink>

      <div className="mt-4">
        <PageHeader
          title={client.name}
          description={client.company ?? undefined}
          actions={
            canEdit && (
              <>
                {client.portalEnabled && <DisablePortalButton clientId={client.id} clientName={client.name} />}
                <Button asChild className="h-10 rounded-lg">
                  <Link href={`${basePath}/edit`}>
                    <Pencil aria-hidden className="size-4" />
                    Edit
                  </Link>
                </Button>
              </>
            )
          }
        />
      </div>

      <div className="mt-6">
        <TabLinks label="Client sections" tabs={tabs} active={tab} />
      </div>

      <div className="mt-6">
        {tab === "overview" && <ClientDetails client={client} />}
        {tab === "proposals" && (
          <ClientProposals
            clientId={client.id}
            proposals={proposals}
            canCreate={hasPermission(ctx.membership.role, permissions.proposalsCreate)}
          />
        )}
        {tab === "projects" && (
          <ClientProjects
            clientId={client.id}
            projects={projects}
            canCreate={hasPermission(ctx.membership.role, permissions.projectsCreate)}
          />
        )}
        {tab === "files" && <ClientFiles clientId={client.id} result={files} page={filesPage} />}
        {tab === "activity" && <ClientActivity organizationId={ctx.organization.id} clientId={client.id} />}
      </div>
    </div>
  );
}

async function ClientActivity({ organizationId, clientId }: { organizationId: string; clientId: string }) {
  const entries = await listActivity(organizationId, activityResources.client, clientId);

  return (
    <Card>
      <CardHeader title="Activity" description="Everything that's happened with this client." />
      {entries.length === 0 ? (
        <EmptyState icon={<Activity />} title="No activity yet" description="Changes to this client will show up here." />
      ) : (
        <div className="mt-2 px-5 pb-3 sm:px-6">
          <ActivityTimeline entries={entries} showSubject={false} />
        </div>
      )}
    </Card>
  );
}
