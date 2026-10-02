import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArchivedRecordsSection } from "@/components/shared/ArchivedRecordsSection";
import { ArchivedRowActions } from "@/components/shared/ArchivedRowActions";
import { BackLink } from "@/components/shared/BackLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchForm } from "@/components/shared/SearchForm";
import { deleteClientAction, restoreClientAction } from "@/server/actions/clients";
import { requireOrganizationContext } from "@/server/auth/organization";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { listArchivedClients } from "@/server/repositories/client.repository";
import { archivedListQuerySchema } from "@/validators/fields";

export const metadata: Metadata = {
  title: "Archived clients",
};

const pathname = "/dashboard/clients/archived";

export default async function ArchivedClientsPage(props: PageProps<"/dashboard/clients/archived">) {
  const { organization, membership } = await requireOrganizationContext();

  if (!hasPermission(membership.role, permissions.clientsDelete)) {
    notFound();
  }

  const query = archivedListQuerySchema.parse(await props.searchParams);
  const result = await listArchivedClients(organization.id, query);

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <BackLink href="/dashboard/clients">Clients</BackLink>
      <div className="mt-4">
        <PageHeader
          title="Archived clients"
          description="Restore a client to bring them and their contacts back, or delete them permanently."
        />
      </div>

      <div className="mt-8 space-y-5">
        <SearchForm action={pathname} label="Search archived clients" placeholder="Search name, email or company" defaultValue={query.q} />

        <ArchivedRecordsSection
          result={result}
          query={query}
          pathname={pathname}
          recordLabel="Client"
          pluralLabel="clients"
          renderActions={(client) => (
            <ArchivedRowActions
              name={client.name}
              permanentDescription="This client, their contacts, and their activity history will be erased from the database. This can't be undone. Clients with proposals can't be deleted permanently."
              onRestore={restoreClientAction.bind(null, client.id)}
              onDeletePermanently={deleteClientAction.bind(null, client.id, "permanent")}
            />
          )}
        />
      </div>
    </div>
  );
}
