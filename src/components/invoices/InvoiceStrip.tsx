import Link from "next/link";

import { duePhrase } from "@/features/invoices/due-phrase";
import { displayStatus, invoiceTones } from "@/features/invoices/invoice-status";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/utils/format";
import type { InvoiceListRow } from "@/server/repositories/invoice.repository";

import { duePhraseStyles, invoiceToneStyles } from "./invoice-tones";
import { InvoiceNumber } from "./InvoiceNumber";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { SlimMeter } from "./SlimMeter";

type InvoiceStripProps = {
  invoice: InvoiceListRow;
  href: string;
  today: string;
  showClient?: boolean;
};

export function InvoiceStrip({ invoice, href, today, showClient = true }: InvoiceStripProps) {
  const status = displayStatus(invoice, today);
  const due = duePhrase(invoice, today);
  const subtitle = [showClient ? invoice.clientName : null, invoice.projectName].filter(Boolean).join(", ");

  return (
    <li>
      <Link
        href={href}
        className="group relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 py-4 pl-5 pr-4 outline-none transition-colors hover:bg-ink-50 focus-visible:bg-ink-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:pl-6 sm:pr-5"
      >
        <span aria-hidden className={cn("absolute inset-y-3 left-0 w-1 rounded-r-full", invoiceToneStyles[invoiceTones[status]].spine)} />

        <span className="min-w-0">
          <InvoiceNumber value={invoice.invoiceNumber} className="text-[15px]" />
          {subtitle && <span className="mt-0.5 block truncate text-[13.5px] text-ink-500">{subtitle}</span>}
          {status === "PARTIALLY_PAID" && (
            <span className="mt-1.5 block">
              <SlimMeter amountPaid={invoice.amountPaid} total={invoice.total} />
            </span>
          )}
        </span>

        <span className={cn("order-last col-span-2 text-[13.5px] font-medium sm:order-0 sm:col-span-1", duePhraseStyles[due.tone])}>
          {due.text}
        </span>

        <span className="flex flex-col items-end gap-1.5">
          <span className="font-display text-[17px] font-semibold tabular-nums tracking-[-0.01em] text-ink-900">
            {formatMoney(invoice.total, invoice.currency)}
          </span>
          <InvoiceStatusBadge status={status} />
        </span>
      </Link>
    </li>
  );
}
