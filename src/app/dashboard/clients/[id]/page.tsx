import type { Metadata } from "next";
import Link from "next/link";
import { Activity, Pencil } from "lucide-react";

import { ClientDetails } from "@/components/clients/ClientDetails";
import { ClientProjects } from "@/components/clients/ClientProjects";
import { ClientProposals } from "@/components/clients/ClientProposals";
import { ContactsCard } from "@/components/clients/ContactsCard";
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
import { listClientProjects } from "@/server/repositories/project.repository";
import { listClientProposals } from "@/server/repositories/proposal.repository";
import { listActivity } from "@/server/services/activity.service";
import { listContacts } from "@/server/services/client-contact.service";
import { clientTabSchema, type ClientTab } from "@/validators/clients";

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
  const canEdit = hasPermission(ctx.membership.role, permissions.clientsUpdate);
  const [contacts, proposals, projects] = await Promise.all([
    listContacts(ctx.organization.id, client.id),
    listClientProposals(ctx.organization.id, client.id),
    listClientProjects(ctx.organization.id, client.id),
  ]);
  const basePath = `/dashboard/clients/${client.id}`;

  const tabs: { value: ClientTab; label: string; href: string; count?: number }[] = [
    { value: "overview", label: "Overview", href: basePath },
    { value: "contacts", label: "Contacts", href: `${basePath}?tab=contacts`, count: contacts.length },
    { value: "proposals", label: "Proposals", href: `${basePath}?tab=proposals`, count: proposals.length },
    { value: "projects", label: "Projects", href: `${basePath}?tab=projects`, count: projects.length },
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
              <Button asChild className="h-10 rounded-lg">
                <Link href={`${basePath}/edit`}>
                  <Pencil aria-hidden className="size-4" />
                  Edit
                </Link>
              </Button>
            )
          }
        />
      </div>

      <div className="mt-6">
        <TabLinks label="Client sections" tabs={tabs} active={tab} />
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="grid items-start gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ClientDetails client={client} />
            </div>
            <ContactsCard clientId={client.id} contacts={contacts} canEdit={canEdit} />
          </div>
        )}
        {tab === "contacts" && <ContactsCard clientId={client.id} contacts={contacts} canEdit={canEdit} />}
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
