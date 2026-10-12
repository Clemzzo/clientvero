import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { after } from "next/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ClientSettlementLine } from "@/components/invoices/ClientSettlementLine";
import { InvoiceDocument } from "@/components/invoices/InvoiceDocument";
import { PrintButton } from "@/components/invoices/PrintButton";
import { todayIso } from "@/features/invoices/invoice-dates";
import { requirePortalContext } from "@/server/auth/portal-session";
import { NotFoundError } from "@/server/errors";
import { getPortalInvoice, markInvoiceViewed } from "@/server/services/client-invoice.service";
import { invoiceIdSchema } from "@/validators/invoices";

const loadInvoice = cache(async (slug: string, id: string) => {
  const context = await requirePortalContext(slug);
  const invoiceId = invoiceIdSchema.safeParse(id);

  if (!invoiceId.success) {
    notFound();
  }

  try {
    return { context, invoice: await getPortalInvoice(context, invoiceId.data) };
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
});

export async function generateMetadata(props: PageProps<"/portal/[slug]/invoices/[id]">): Promise<Metadata> {
  const { slug, id } = await props.params;
  const { invoice } = await loadInvoice(slug, id);
  return { title: invoice.document.invoiceNumber };
}

export default async function PortalInvoicePage(props: PageProps<"/portal/[slug]/invoices/[id]">) {
  const { slug, id } = await props.params;
  const { context, invoice } = await loadInvoice(slug, id);
  const { document } = invoice;

  if (invoice.status === "SENT") {
    after(() => markInvoiceViewed(invoice));
  }

  return (
    <div className="rounded-3xl bg-ink-100 px-3 py-5 sm:p-8 print:rounded-none print:bg-white print:p-0">
      <div className="mx-auto max-w-190 space-y-6">
        <Link
          href={`/portal/${context.organization.slug}/invoices`}
          className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-500 hover:text-ink-900 print:hidden"
        >
          <ArrowLeft aria-hidden className="size-4" />
          All invoices
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <ClientSettlementLine
            status={invoice.status}
            currency={document.currency}
            total={document.total}
            amountDue={document.amountDue}
            dueDate={invoice.dueDate}
            paidAt={invoice.paidAt}
            businessName={invoice.organizationName}
            today={todayIso()}
          />
          <PrintButton />
        </div>
        <InvoiceDocument invoice={document} />
      </div>
    </div>
  );
}
