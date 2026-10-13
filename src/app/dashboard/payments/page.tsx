import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, SearchX } from "lucide-react";

import { PaymentTotals } from "@/components/payments/PaymentTotals";
import { PaymentsTable } from "@/components/payments/PaymentsTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchForm } from "@/components/shared/SearchForm";
import { TabLinks } from "@/components/shared/TabLinks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { paymentMethodFilterLabels, paymentMethodFilters, type PaymentMethodFilter } from "@/features/invoices/payment-methods";
import { resolveTimeZone } from "@/lib/utils/timezone";
import { requireOrganizationContext } from "@/server/auth/organization";
import { permissions, requirePermission } from "@/server/authorization/permissions";
import { getPaymentTotals, listPayments } from "@/server/repositories/payment.repository";
import { paymentListQuerySchema } from "@/validators/invoices";

export const metadata: Metadata = {
  title: "Payments",
};

const pathname = "/dashboard/payments";

function filterHref(method: PaymentMethodFilter, q: string) {
  const params = new URLSearchParams();
  if (method !== "all") params.set("method", method);
  if (q) params.set("q", q);
  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

export default async function PaymentsPage(props: PageProps<"/dashboard/payments">) {
  const ctx = await requireOrganizationContext();
  requirePermission(ctx, permissions.invoicesRead);
  const { organization } = ctx;
  const query = paymentListQuerySchema.parse(await props.searchParams);
  const [result, totals] = await Promise.all([
    listPayments(organization.id, query),
    getPaymentTotals(organization.id, organization.currency, resolveTimeZone(ctx.user.timezone)),
  ]);
  const filtered = Boolean(query.q) || query.method !== "all";

  const tabs = paymentMethodFilters.map((method) => ({
    value: method,
    label: paymentMethodFilterLabels[method],
    href: filterHref(method, query.q),
    count: result.counts[method],
  }));

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <PageHeader title="Payments" description="Every payment you've recorded, across all invoices." />

      <div className="mt-8 space-y-5">
        <PaymentTotals totals={totals} currency={organization.currency} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <TabLinks label="Filter payments by method" tabs={tabs} active={query.method} />
          <SearchForm
            action={pathname}
            label="Search payments"
            placeholder="Search invoice, client or reference"
            defaultValue={query.q}
            hiddenFields={{ method: query.method === "all" ? undefined : query.method }}
          />
        </div>

        {result.total === 0 ? (
          <Card>
            {filtered ? (
              <EmptyState
                icon={<SearchX />}
                title="No payments match"
                description="Try a different search or payment method."
                action={
                  <Button asChild variant="outline" className="rounded-lg">
                    <Link href={pathname}>Show all payments</Link>
                  </Button>
                }
                className="py-16"
              />
            ) : (
              <EmptyState
                icon={<Banknote />}
                title="No payments yet"
                description="When a client pays, open the invoice and record the payment. It will show up here."
                action={
                  <Button asChild variant="outline" className="rounded-lg">
                    <Link href="/dashboard/invoices">Go to invoices</Link>
                  </Button>
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
              description={`There ${result.pageCount === 1 ? "is only 1 page" : `are only ${result.pageCount} pages`} of payments.`}
              action={
                <Button asChild variant="outline" className="rounded-lg">
                  <Link href={filterHref(query.method, query.q)}>Go to the first page</Link>
                </Button>
              }
              className="py-16"
            />
          </Card>
        ) : (
          <>
            <PaymentsTable payments={result.rows} />
            <Pagination
              page={query.page}
              pageCount={result.pageCount}
              pathname={pathname}
              searchParams={{ q: query.q, method: query.method === "all" ? undefined : query.method }}
            />
          </>
        )}
      </div>
    </div>
  );
}
