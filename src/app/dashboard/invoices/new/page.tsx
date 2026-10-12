import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InvoiceBuilder } from "@/components/invoices/InvoiceBuilder";
import { BackLink } from "@/components/shared/BackLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { newInvoiceValues } from "@/features/invoices/builder-values";
import { todayIso } from "@/features/invoices/invoice-dates";
import { businessParty } from "@/features/invoices/invoice-document";
import { formatInvoiceNumber } from "@/features/invoices/invoice-number";
import { createInvoiceAction } from "@/server/actions/invoices";
import { requireOrganizationContext } from "@/server/auth/organization";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { listBillableClients, listInvoiceProjectOptions } from "@/server/repositories/invoice.repository";
import { getInvoicePrefill } from "@/server/services/invoice.service";
import { invoicePrefillSchema } from "@/validators/invoices";

export const metadata: Metadata = {
  title: "New invoice",
};

export default async function NewInvoicePage(props: PageProps<"/dashboard/invoices/new">) {
  const { organization, membership } = await requireOrganizationContext();

  if (!hasPermission(membership.role, permissions.invoicesCreate)) {
    notFound();
  }

  const target = invoicePrefillSchema.parse(await props.searchParams);
  const [clients, projects, prefill] = await Promise.all([
    listBillableClients(organization.id),
    listInvoiceProjectOptions(organization.id),
    getInvoicePrefill(organization.id, organization.currency, target),
  ]);

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <BackLink href="/dashboard/invoices">Invoices</BackLink>
      <div className="mt-4">
        <PageHeader title="New invoice" description="Saved as a draft. You can check it before sending." />
      </div>
      <div className="mt-8">
        <InvoiceBuilder
          action={createInvoiceAction}
          clients={clients}
          projects={projects}
          business={businessParty(organization)}
          invoiceNumber={formatInvoiceNumber(organization.invoiceSequence + 1)}
          status="DRAFT"
          values={newInvoiceValues(prefill, todayIso())}
          cancelHref="/dashboard/invoices"
          submitLabel="Save draft"
        />
      </div>
    </div>
  );
}
