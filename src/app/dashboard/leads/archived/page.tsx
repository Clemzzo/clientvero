import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArchivedRecordsSection } from "@/components/shared/ArchivedRecordsSection";
import { ArchivedRowActions } from "@/components/shared/ArchivedRowActions";
import { BackLink } from "@/components/shared/BackLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchForm } from "@/components/shared/SearchForm";
import { deleteLeadAction, restoreLeadAction } from "@/server/actions/leads";
import { requireOrganizationContext } from "@/server/auth/organization";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { listArchivedLeads } from "@/server/repositories/lead.repository";
import { archivedListQuerySchema } from "@/validators/fields";

export const metadata: Metadata = {
  title: "Archived leads",
};

const pathname = "/dashboard/leads/archived";

export default async function ArchivedLeadsPage(props: PageProps<"/dashboard/leads/archived">) {
  const { organization, membership } = await requireOrganizationContext();

  if (!hasPermission(membership.role, permissions.leadsDelete)) {
    notFound();
  }

  const query = archivedListQuerySchema.parse(await props.searchParams);
  const result = await listArchivedLeads(organization.id, query);

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <BackLink href="/dashboard/leads">Leads</BackLink>
      <div className="mt-4">
        <PageHeader
          title="Archived leads"
          description="Restore a lead to bring it back to your leads and pipeline, or delete it permanently."
        />
      </div>

      <div className="mt-8 space-y-5">
        <SearchForm action={pathname} label="Search archived leads" placeholder="Search name, email or company" defaultValue={query.q} />

        <ArchivedRecordsSection
          result={result}
          query={query}
          pathname={pathname}
          recordLabel="Lead"
          pluralLabel="leads"
          renderActions={(lead) => (
            <ArchivedRowActions
              name={lead.name}
              permanentDescription="This lead and its activity history will be erased from the database. This can't be undone."
              onRestore={restoreLeadAction.bind(null, lead.id)}
              onDeletePermanently={deleteLeadAction.bind(null, lead.id, "permanent")}
            />
          )}
        />
      </div>
    </div>
  );
}
