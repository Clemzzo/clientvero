import type { InvoiceStatus } from "@/db/schema";
import { invoiceStatusLabels, invoiceTones } from "@/features/invoices/invoice-status";
import { cn } from "@/lib/utils";

import { invoiceToneStyles } from "./invoice-tones";

type InvoiceStatusBadgeProps = {
  status: InvoiceStatus;
  className?: string;
};

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12.5px] font-semibold",
        invoiceToneStyles[invoiceTones[status]].badge,
        className,
      )}
    >
      {invoiceStatusLabels[status]}
    </span>
  );
}
