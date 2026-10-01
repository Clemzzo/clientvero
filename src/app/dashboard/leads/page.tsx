import type { Metadata } from "next";
import Link from "next/link";
import { Plus, SearchX, UserPlus } from "lucide-react";

import { LeadPipeline } from "@/components/leads/LeadPipeline";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadsToolbar } from "@/components/leads/LeadsToolbar";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireOrganizationContext } from "@/server/auth/organization";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { listLeads, pipelineLeads } from "@/server/repositories/lead.repository";
import { leadListQuerySchema, type LeadListQuery } from "@/validators/leads";

export const metadata: Metadata = {
  title: "Leads",
};

function NewLeadButton({ label = "New lead" }: { label?: string }) {
  return (
    <Button asChild className="rounded-lg">
      <Link href="/dashboard/leads/new">
        <Plus aria-hidden className="size-4" />
        {label}
      </Link>
    </Button>
  );
}

function LeadsEmptyState({ query, canCreate }: { query: LeadListQuery; canCreate: boolean }) {
  const filtered = Boolean(query.q || query.status);

  return (
    <Card>
      {filtered ? (
        <EmptyState
          icon={<SearchX />}
          title="No leads match"
          description="Try a different search or clear the filters to see every lead."
          action={
            <Button asChild variant="outline" className="rounded-lg">
              <Link href={query.view === "pipeline" ? "/dashboard/leads?view=pipeline" : "/dashboard/leads"}>
                Clear filters
              </Link>
            </Button>
          }
          className="py-16"
        />
      ) : (
        <EmptyState
          icon={<UserPlus />}
          title="No leads yet"
          description="Add the people you're talking to and track every deal from first contact to won."
          action={canCreate && <NewLeadButton label="Add your first lead" />}
          className="py-16"
        />
      )}
    </Card>
  );
}

export default async function LeadsPage(props: PageProps<"/dashboard/leads">) {
  const { organization, membership } = await requireOrganizationContext();
  const query = leadListQuerySchema.parse(await props.searchParams);
  const canCreate = hasPermission(membership.role, permissions.leadsCreate);
  const canUpdate = hasPermission(membership.role, permissions.leadsUpdate);
  const canDelete = hasPermission(membership.role, permissions.leadsDelete);

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <PageHeader
        title="Leads"
        description="Everyone you're talking to, from first contact to won."
        actions={canCreate && <NewLeadButton />}
      />

      <div className="mt-8 space-y-5">
        <LeadsToolbar query={query} />

        {query.view === "pipeline" ? (
          <PipelineView organizationId={organization.id} query={query} canCreate={canCreate} canUpdate={canUpdate} />
        ) : (
          <ListView organizationId={organization.id} query={query} canCreate={canCreate} canDelete={canDelete} />
        )}
      </div>
    </div>
  );
}

type ViewProps = {
  organizationId: string;
  query: LeadListQuery;
  canCreate: boolean;
};

async function ListView({ organizationId, query, canCreate, canDelete }: ViewProps & { canDelete: boolean }) {
  const result = await listLeads(organizationId, query);

  if (result.total === 0) {
    return <LeadsEmptyState query={query} canCreate={canCreate} />;
  }

  if (result.rows.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<SearchX />}
          title="This page is empty"
          description={`There are only ${result.pageCount} pages of leads.`}
          action={
            <Button asChild variant="outline" className="rounded-lg">
              <Link href="/dashboard/leads">Go to the first page</Link>
            </Button>
          }
          className="py-16"
        />
      </Card>
    );
  }

  return (
    <>
      <LeadsTable leads={result.rows} canDelete={canDelete} />
      <Pagination
        page={query.page}
        pageCount={result.pageCount}
        pathname="/dashboard/leads"
        searchParams={{ q: query.q, status: query.status }}
      />
    </>
  );
}

async function PipelineView({ organizationId, query, canCreate, canUpdate }: ViewProps & { canUpdate: boolean }) {
  const pipeline = await pipelineLeads(organizationId, query);
  const total = pipeline.columns.reduce((sum, column) => sum + column.total, 0) + pipeline.closed.WON + pipeline.closed.LOST;

  if (total === 0) {
    return <LeadsEmptyState query={query} canCreate={canCreate} />;
  }

  return <LeadPipeline pipeline={pipeline} canUpdate={canUpdate} />;
}
