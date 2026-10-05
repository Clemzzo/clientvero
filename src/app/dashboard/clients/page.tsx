import type { Metadata } from "next";
import Link from "next/link";
import { Plus, SearchX, Users } from "lucide-react";

import { ClientsTable } from "@/components/clients/ClientsTable";
import { ArchivedLinkButton } from "@/components/shared/ArchivedLinkButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchForm } from "@/components/shared/SearchForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireOrganizationContext } from "@/server/auth/organization";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { listClients } from "@/server/repositories/client.repository";
import { clientListQuerySchema } from "@/validators/clients";

export const metadata: Metadata = {
  title: "Clients",
};

function NewClientButton({ variant = "default" }: { variant?: "default" | "outline" }) {
  return (
    <Button asChild variant={variant} className="rounded-lg">
      <Link href="/dashboard/clients/new">
        <Plus aria-hidden className="size-4" />
        New client
      </Link>
    </Button>
  );
}

export default async function ClientsPage(props: PageProps<"/dashboard/clients">) {
  const { organization, membership } = await requireOrganizationContext();
  const query = clientListQuerySchema.parse(await props.searchParams);
  const canCreate = hasPermission(membership.role, permissions.clientsCreate);
  const canDelete = hasPermission(membership.role, permissions.clientsDelete);
  const canManagePortal = hasPermission(membership.role, permissions.clientsUpdate);
  const result = await listClients(organization.id, query);

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <PageHeader
        title="Clients"
        description="Everyone you're working with, and the people you deal with are stored here. You can add them manually, or convert a won lead into a client."
        actions={
          (canDelete || canCreate) && (
            <>
              {canDelete && <ArchivedLinkButton href="/dashboard/clients/archived" />}
              {canCreate && <NewClientButton />}
            </>
          )
        }
      />

      <div className="mt-8 space-y-5">
        <SearchForm
          action="/dashboard/clients"
          label="Search clients"
          placeholder="Search name, email or company"
          defaultValue={query.q}
        />

        {result.total === 0 ? (
          <Card>
            {query.q ? (
              <EmptyState
                icon={<SearchX />}
                title="No clients match"
                description="Try a different search, or clear it to see every client."
                action={
                  <Button asChild variant="outline" className="rounded-lg">
                    <Link href="/dashboard/clients">Clear search</Link>
                  </Button>
                }
                className="py-16"
              />
            ) : (
              <EmptyState
                icon={<Users />}
                title="No clients yet"
                description="Convert a won lead into a client, or add one directly."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button asChild className="rounded-lg">
                      <Link href="/dashboard/leads">Convert a lead</Link>
                    </Button>
                    {canCreate && <NewClientButton variant="outline" />}
                  </div>
                }
                className="py-16"
              />
            )}
          </Card>
        ) : result.rows.length === 0 ? (
          <Card>
            <EmptyState
              icon={<SearchX />}
              title="This page is empty"
              description={`There are only ${result.pageCount} pages of clients.`}
              action={
                <Button asChild variant="outline" className="rounded-lg">
                  <Link href="/dashboard/clients">Go to the first page</Link>
                </Button>
              }
              className="py-16"
            />
          </Card>
        ) : (
          <>
            <ClientsTable clients={result.rows} canManagePortal={canManagePortal} canDelete={canDelete} />
            <Pagination page={query.page} pageCount={result.pageCount} pathname="/dashboard/clients" searchParams={{ q: query.q }} />
          </>
        )}
      </div>
    </div>
  );
}
