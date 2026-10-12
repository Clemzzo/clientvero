import Link from "next/link";
import { Plus, ReceiptText } from "lucide-react";

import { InvoiceStripList } from "@/components/invoices/InvoiceStripList";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { InvoiceListRow } from "@/server/repositories/invoice.repository";

type ClientInvoicesProps = {
  clientId: string;
  invoices: InvoiceListRow[];
  today: string;
  canCreate: boolean;
};

export function ClientInvoices({ clientId, invoices, today, canCreate }: ClientInvoicesProps) {
  const newInvoiceHref = `/dashboard/invoices/new?clientId=${clientId}`;

  if (invoices.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<ReceiptText />}
          title="No invoices yet"
          description="Bill this client for finished work. They'll get a link to view and print the invoice."
          action={
            canCreate && (
              <Button asChild className="rounded-lg">
                <Link href={newInvoiceHref}>
                  <Plus aria-hidden className="size-4" />
                  New invoice
                </Link>
              </Button>
            )
          }
          className="py-14"
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {canCreate && (
        <div className="flex justify-end">
          <Button asChild variant="outline" className="h-9 rounded-lg">
            <Link href={newInvoiceHref}>
              <Plus aria-hidden className="size-4" />
              New invoice
            </Link>
          </Button>
        </div>
      )}
      <InvoiceStripList
        label="Invoices for this client"
        invoices={invoices}
        today={today}
        showClient={false}
        hrefFor={(invoice) => `/dashboard/invoices/${invoice.id}`}
      />
    </div>
  );
}
