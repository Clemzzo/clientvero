import { AlertTriangle, CircleCheck, CircleSlash, Clock } from "lucide-react";

import type { InvoiceStatus } from "@/db/schema";
import { displayStatus } from "@/features/invoices/invoice-status";
import { cn } from "@/lib/utils";
import { formatDate, formatMoney } from "@/lib/utils/format";

type ClientSettlementLineProps = {
  status: InvoiceStatus;
  currency: string;
  total: string;
  amountDue: string;
  dueDate: string;
  paidAt: Date | null;
  businessName: string;
  today: string;
};

export function ClientSettlementLine(props: ClientSettlementLineProps) {
  const status = displayStatus(props, props.today);
  const amount = (value: string) => (
    <span className="font-display text-[26px] font-bold tracking-[-0.02em] tabular-nums text-ink-900">{formatMoney(value, props.currency)}</span>
  );

  if (status === "PAID") {
    return (
      <p role="status" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-medium text-mint-800">
        <CircleCheck aria-hidden className="size-6 text-mint-600" />
        {amount(props.total)}
        Paid in full{props.paidAt ? ` on ${formatDate(props.paidAt.toISOString().slice(0, 10))}` : ""}. Thank you.
      </p>
    );
  }

  if (status === "CANCELLED") {
    return (
      <p role="status" className="flex items-center gap-3 text-[15px] font-medium text-ink-700">
        <CircleSlash aria-hidden className="size-6 text-ink-500" />
        {props.businessName} cancelled this invoice. Nothing is owed.
      </p>
    );
  }

  const late = status === "OVERDUE";
  const Icon = late ? AlertTriangle : Clock;

  return (
    <p role="status" className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-medium", late ? "text-coral-700" : "text-ink-700")}>
      <Icon aria-hidden className={cn("size-6", late ? "text-coral-600" : "text-sun-600")} />
      {amount(props.amountDue)}
      {late ? `was due on ${formatDate(props.dueDate)}` : `due by ${formatDate(props.dueDate)}`}
    </p>
  );
}
