import type { Metadata } from "next";
import { ReceiptText } from "lucide-react";

import { InvoiceStripList } from "@/components/invoices/InvoiceStripList";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { viewerToday } from "@/lib/utils/viewer-today";
import { requirePortalContext } from "@/server/auth/portal-session";
import { listPortalInvoices } from "@/server/services/client-invoice.service";

export const metadata: Metadata = {
  title: "Invoices",
};

export default async function PortalInvoicesPage(props: PageProps<"/portal/[slug]/invoices">) {
  const context = await requirePortalContext((await props.params).slug);
  const [invoices, today] = await Promise.all([listPortalInvoices(context), viewerToday()]);
  const slug = context.organization.slug;

  return (
    <div className="space-y-8">
      <PageHeader title="Invoices" description={`Invoices from ${context.organization.name}, with what's paid and what's still due.`} />

      {invoices.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ReceiptText />}
            title="No invoices yet"
            description={`When ${context.organization.name} sends you an invoice, it will appear here.`}
            className="py-16"
          />
        </Card>
      ) : (
        <InvoiceStripList
          label="Your invoices"
          invoices={invoices}
          today={today}
          showClient={false}
          hrefFor={(invoice) => `/portal/${slug}/invoices/${invoice.id}`}
        />
      )}
    </div>
  );
}
