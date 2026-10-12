import type { Metadata } from "next";
import Link from "next/link";
import { Plus, ReceiptText, SearchX } from "lucide-react";

import { CashflowRail } from "@/components/invoices/CashflowRail";
import { InvoiceStripList } from "@/components/invoices/InvoiceStripList";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchForm } from "@/components/shared/SearchForm";
import { TabLinks } from "@/components/shared/TabLinks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { todayIso } from "@/features/invoices/invoice-dates";
import { invoiceFilterLabels, invoiceFilters, type InvoiceFilter } from "@/features/invoices/invoice-status";
import { requireOrganizationContext } from "@/server/auth/organization";
import { hasPermission, permissions, requirePermission } from "@/server/authorization/permissions";
import { getInvoiceMoneySummary, listInvoices } from "@/server/repositories/invoice.repository";
import { invoiceListQuerySchema } from "@/validators/invoices";

export const metadata: Metadata = {
  title: "Invoices",
};

function filterHref(filter: InvoiceFilter, q: string) {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("status", filter);
  if (q) params.set("q", q);
  const search = params.toString();
  return search ? `/dashboard/invoices?${search}` : "/dashboard/invoices";
}

function NewInvoiceButton({ label = "New invoice" }: { label?: string }) {
  return (
    <Button asChild className="rounded-lg">
      <Link href="/dashboard/invoices/new">
        <Plus aria-hidden className="size-4" />
        {label}
      </Link>
    </Button>
  );
}

export default async function InvoicesPage(props: PageProps<"/dashboard/invoices">) {
  const ctx = await requireOrganizationContext();
  requirePermission(ctx, permissions.invoicesRead);
  const { organization, membership } = ctx;
  const query = invoiceListQuerySchema.parse(await props.searchParams);
  const canCreate = hasPermission(membership.role, permissions.invoicesCreate);
  const [result, summary] = await Promise.all([
    listInvoices(organization.id, query),
    getInvoiceMoneySummary(organization.id, organization.currency),
  ]);
  const filtered = Boolean(query.q) || query.status !== "all";
  const today = todayIso();

  const tabs = invoiceFilters.map((filter) => ({
    value: filter,
    label: invoiceFilterLabels[filter],
    href: filterHref(filter, query.q),
    count: result.counts[filter],
  }));

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <PageHeader
        title="Invoices"
        description="Bill clients for your work and see what's settled, owed and late."
        actions={canCreate && <NewInvoiceButton />}
      />

      <div className="mt-8 space-y-5">
        <CashflowRail summary={summary} currency={organization.currency} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <TabLinks label="Filter invoices by status" tabs={tabs} active={query.status} />
          <SearchForm
            action="/dashboard/invoices"
            label="Search invoices"
            placeholder="Search number or client"
            defaultValue={query.q}
            hiddenFields={{ status: query.status === "all" ? undefined : query.status }}
          />
        </div>

        {result.total === 0 ? (
          <Card>
            {filtered ? (
              <EmptyState
                icon={<SearchX />}
                title="No invoices match"
                description="Try a different search or status."
                action={
                  <Button asChild variant="outline" className="rounded-lg">
                    <Link href="/dashboard/invoices">Show all invoices</Link>
                  </Button>
                }
                className="py-16"
              />
            ) : (
              <EmptyState
                icon={<ReceiptText />}
                title="No invoices yet"
                description="Bill a client for finished work. They get a link to view the invoice, and you record payments as they arrive."
                action={canCreate && <NewInvoiceButton label="Create your first invoice" />}
                className="py-16"
              />
            )}
          </Card>
        ) : result.rows.length === 0 ? (
          <Card>
            <EmptyState
              icon={<SearchX />}
              title="This page is empty"
              description={`There are only ${result.pageCount} pages of invoices.`}
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
            <InvoiceStripList
              label="Invoices"
              invoices={result.rows}
              today={today}
              hrefFor={(invoice) => `/dashboard/invoices/${invoice.id}`}
            />
            <Pagination
              page={query.page}
              pageCount={result.pageCount}
              pathname="/dashboard/invoices"
              searchParams={{ q: query.q, status: query.status === "all" ? undefined : query.status }}
            />
          </>
        )}
      </div>
    </div>
  );
}
