import type { InvoiceListRow } from "@/server/repositories/invoice.repository";

import { InvoiceStrip } from "./InvoiceStrip";

type InvoiceStripListProps = {
  invoices: InvoiceListRow[];
  today: string;
  hrefFor: (invoice: InvoiceListRow) => string;
  label: string;
  showClient?: boolean;
};

export function InvoiceStripList({ invoices, today, hrefFor, label, showClient }: InvoiceStripListProps) {
  return (
    <ul aria-label={label} className="divide-y divide-ink-200 overflow-hidden rounded-2xl border border-ink-200 bg-white">
      {invoices.map((invoice) => (
        <InvoiceStrip key={invoice.id} invoice={invoice} href={hrefFor(invoice)} today={today} showClient={showClient} />
      ))}
    </ul>
  );
}
