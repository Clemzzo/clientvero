import { cache } from "react";
import type { Metadata } from "next";
import { after } from "next/server";
import { notFound } from "next/navigation";

import { ClientSettlementLine } from "@/components/invoices/ClientSettlementLine";
import { InvoiceDocument } from "@/components/invoices/InvoiceDocument";
import { PrintButton } from "@/components/invoices/PrintButton";
import { TimeZoneCookie } from "@/components/shared/time-zone-cookie";
import { viewerToday } from "@/lib/utils/viewer-today";
import { getPublicInvoice, markInvoiceViewed } from "@/server/services/client-invoice.service";
import { invoicePublicIdSchema } from "@/validators/invoices";

const loadInvoice = cache(async (publicId: string) => {
  const parsed = invoicePublicIdSchema.safeParse(publicId);
  const invoice = parsed.success ? await getPublicInvoice(parsed.data) : null;

  if (!invoice) {
    notFound();
  }

  return invoice;
});

export async function generateMetadata(props: PageProps<"/invoice/[publicId]">): Promise<Metadata> {
  const invoice = await loadInvoice((await props.params).publicId);

  return {
    title: `${invoice.document.invoiceNumber} from ${invoice.organizationName}`,
    robots: { index: false, follow: false },
  };
}

export default async function PublicInvoicePage(props: PageProps<"/invoice/[publicId]">) {
  const invoice = await loadInvoice((await props.params).publicId);
  const { document } = invoice;
  const today = await viewerToday();

  if (invoice.status === "SENT") {
    after(() => markInvoiceViewed(invoice));
  }

  return (
    <main className="min-h-dvh bg-ink-100 px-4 pb-16 pt-8 sm:pt-14 print:bg-white print:p-0">
      <div className="mx-auto max-w-190 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <ClientSettlementLine
            status={invoice.status}
            currency={document.currency}
            total={document.total}
            amountDue={document.amountDue}
            dueDate={invoice.dueDate}
            paidAt={invoice.paidAt}
            businessName={invoice.organizationName}
            today={today}
          />
          <PrintButton />
        </div>
        <InvoiceDocument invoice={document} />
        <p className="text-center text-[12.5px] text-ink-500 print:hidden">Sent with ClientVero</p>
        <TimeZoneCookie />
      </div>
    </main>
  );
}
