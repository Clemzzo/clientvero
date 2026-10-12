import Link from "next/link";
import { ArrowRight, ReceiptText } from "lucide-react";

import { IconTile } from "@/components/shared/IconTile";
import { displayStatus, isOpen } from "@/features/invoices/invoice-status";
import { formatMoney } from "@/lib/utils/format";
import { fromCents, toCents } from "@/lib/utils/money";
import type { InvoiceListRow } from "@/server/repositories/invoice.repository";

type AmountDueNoticeProps = {
  invoices: InvoiceListRow[];
  href: string;
  today: string;
};

export function AmountDueNotice({ invoices, href, today }: AmountDueNoticeProps) {
  const open = invoices.filter((invoice) => isOpen(invoice.status));
  if (open.length === 0) return null;

  const byCurrency = new Map<string, bigint>();
  for (const invoice of open) {
    byCurrency.set(invoice.currency, (byCurrency.get(invoice.currency) ?? 0n) + toCents(invoice.amountDue));
  }

  const amounts = [...byCurrency].map(([currency, cents]) => formatMoney(fromCents(cents), currency)).join(" and ");
  const late = open.filter((invoice) => displayStatus(invoice, today) === "OVERDUE").length;

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-ink-200 bg-white p-5 transition-colors hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-brand-600"
    >
      <IconTile icon={<ReceiptText />} tone={late > 0 ? "coral" : "sun"} size="md" />
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[20px] font-bold tracking-[-0.02em] tabular-nums text-ink-900">{amounts} due</span>
        <span className="block text-[13.5px] text-ink-500">
          {open.length === 1 ? "1 invoice to pay" : `${open.length} invoices to pay`}
          {late > 0 && <span className="font-medium text-coral-700">, {late} past the due date</span>}
        </span>
      </span>
      <ArrowRight aria-hidden className="size-5 text-ink-500 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
