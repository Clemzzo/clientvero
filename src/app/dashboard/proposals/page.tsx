import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Plus, SearchX } from "lucide-react";

import { ProposalsTable } from "@/components/proposals/ProposalsTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchForm } from "@/components/shared/SearchForm";
import { TabLinks } from "@/components/shared/TabLinks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireOrganizationContext } from "@/server/auth/organization";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { listProposals } from "@/server/repositories/proposal.repository";
import { proposalListQuerySchema, type ProposalFilter } from "@/validators/proposals";

export const metadata: Metadata = {
  title: "Proposals",
};

const filterLabels: Record<ProposalFilter, string> = {
  all: "All",
  draft: "Drafts",
  sent: "Awaiting response",
  accepted: "Accepted",
  declined: "Declined",
};

function filterHref(filter: ProposalFilter, q: string) {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("status", filter);
  if (q) params.set("q", q);
  const search = params.toString();
  return search ? `/dashboard/proposals?${search}` : "/dashboard/proposals";
}

function NewProposalButton({ label = "New proposal" }: { label?: string }) {
  return (
    <Button asChild className="rounded-lg">
      <Link href="/dashboard/proposals/new">
        <Plus aria-hidden className="size-4" />
        {label}
      </Link>
    </Button>
  );
}

export default async function ProposalsPage(props: PageProps<"/dashboard/proposals">) {
  const { organization, membership } = await requireOrganizationContext();
  const query = proposalListQuerySchema.parse(await props.searchParams);
  const canCreate = hasPermission(membership.role, permissions.proposalsCreate);
  const result = await listProposals(organization.id, query);
  const filtered = Boolean(query.q) || query.status !== "all";

  const tabs = (Object.keys(filterLabels) as ProposalFilter[]).map((filter) => ({
    value: filter,
    label: filterLabels[filter],
    href: filterHref(filter, query.q),
    count: result.counts[filter],
  }));

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <PageHeader
        title="Proposals"
        description="Write a proposal, share the link, and see the moment your client says yes."
        actions={canCreate && <NewProposalButton />}
      />

      <div className="mt-8 space-y-5">
        <TabLinks label="Filter proposals by status" tabs={tabs} active={query.status} />
        <SearchForm
          action="/dashboard/proposals"
          label="Search proposals"
          placeholder="Search title or client"
          defaultValue={query.q}
          hiddenFields={{ status: query.status === "all" ? undefined : query.status }}
        />

        {result.total === 0 ? (
          <Card>
            {filtered ? (
              <EmptyState
                icon={<SearchX />}
                title="No proposals match"
                description="Try a different search or status."
                action={
                  <Button asChild variant="outline" className="rounded-lg">
                    <Link href="/dashboard/proposals">Show all proposals</Link>
                  </Button>
                }
                className="py-16"
              />
            ) : (
              <EmptyState
                icon={<FileText />}
                title="No proposals yet"
                description="Turn a client conversation into a clear, professional proposal they can accept online."
                action={canCreate && <NewProposalButton label="Create your first proposal" />}
                className="py-16"
              />
            )}
          </Card>
        ) : result.rows.length === 0 ? (
          <Card>
            <EmptyState
              icon={<SearchX />}
              title="This page is empty"
              description={`There are only ${result.pageCount} pages of proposals.`}
              action={
                <Button asChild variant="outline" className="rounded-lg">
                  <Link href={filterHref(query.status, query.q)}>Go to the first page</Link>
                </Button>
              }
              className="py-16"
            />
          </Card>
        ) : (
          <>
            <ProposalsTable proposals={result.rows} />
            <Pagination
              page={query.page}
              pageCount={result.pageCount}
              pathname="/dashboard/proposals"
              searchParams={{ q: query.q, status: query.status === "all" ? undefined : query.status }}
            />
          </>
        )}
      </div>
    </div>
  );
}
