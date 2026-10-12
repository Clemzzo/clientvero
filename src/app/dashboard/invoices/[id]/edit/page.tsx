import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { InvoiceBuilder } from "@/components/invoices/InvoiceBuilder";
import { BackLink } from "@/components/shared/BackLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { editInvoiceValues } from "@/features/invoices/builder-values";
import { canEdit } from "@/features/invoices/invoice-status";
import { updateInvoiceAction } from "@/server/actions/invoices";
import { hasPermission, permissions } from "@/server/authorization/permissions";
import { listBillableClients, listInvoiceProjectOptions } from "@/server/repositories/invoice.repository";

import { loadInvoice } from "../load-invoice";

export async function generateMetadata(props: PageProps<"/dashboard/invoices/[id]/edit">): Promise<Metadata> {
  const { invoice } = await loadInvoice((await props.params).id);
  return { title: `Edit ${invoice.invoiceNumber}` };
}

export default async function EditInvoicePage(props: PageProps<"/dashboard/invoices/[id]/edit">) {
  const { ctx, invoice } = await loadInvoice((await props.params).id);
  const detailHref = `/dashboard/invoices/${invoice.id}`;

  if (!hasPermission(ctx.membership.role, permissions.invoicesCreate)) {
    notFound();
  }

  if (!canEdit(invoice)) {
    redirect(`${detailHref}?notice=invoice-locked`);
  }

  const [clients, projects] = await Promise.all([
    listBillableClients(ctx.organization.id),
    listInvoiceProjectOptions(ctx.organization.id),
  ]);

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <BackLink href={detailHref}>{invoice.invoiceNumber}</BackLink>
      <div className="mt-4">
        <PageHeader
          title={`Edit ${invoice.invoiceNumber}`}
          description={invoice.status === "DRAFT" ? undefined : "Your client sees the changes on their link right away."}
        />
      </div>
      <div className="mt-8">
        <InvoiceBuilder
          action={updateInvoiceAction.bind(null, invoice.id)}
          clients={clients}
          projects={projects}
          business={invoice.document.business}
          invoiceNumber={invoice.invoiceNumber}
          status={invoice.status}
          values={editInvoiceValues(invoice)}
          cancelHref={detailHref}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
