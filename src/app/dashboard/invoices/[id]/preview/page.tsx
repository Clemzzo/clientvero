import type { Metadata } from "next";

import { InvoiceDocument } from "@/components/invoices/InvoiceDocument";
import { SettlementMeter } from "@/components/invoices/SettlementMeter";
import { BackLink } from "@/components/shared/BackLink";
import { userToday } from "@/lib/utils/timezone";

import { loadInvoice } from "../load-invoice";

export async function generateMetadata(props: PageProps<"/dashboard/invoices/[id]/preview">): Promise<Metadata> {
  const { invoice } = await loadInvoice((await props.params).id);
  return { title: `Preview ${invoice.invoiceNumber}` };
}

export default async function InvoicePreviewPage(props: PageProps<"/dashboard/invoices/[id]/preview">) {
  const { ctx, invoice } = await loadInvoice((await props.params).id);

  return (
    <div className="min-h-full bg-ink-100 px-4 py-8 sm:px-8 lg:py-10">
      <div className="mx-auto flex max-w-190 flex-wrap items-center justify-between gap-4">
        <BackLink href={`/dashboard/invoices/${invoice.id}`}>Back to {invoice.invoiceNumber}</BackLink>
        <p className="rounded-full bg-white px-3 py-1 text-[12.5px] font-medium text-ink-500">This is what your client sees</p>
      </div>
      <div className="mx-auto mt-6 max-w-190 space-y-5">
        <SettlementMeter
          status={invoice.status}
          currency={invoice.currency}
          total={invoice.total}
          amountPaid={invoice.amountPaid}
          amountDue={invoice.amountDue}
          dueDate={invoice.dueDate}
          paidAt={invoice.paidAt}
          today={userToday(ctx.user.timezone)}
          audience="client"
        />
        <InvoiceDocument invoice={invoice.document} />
      </div>
    </div>
  );
}
