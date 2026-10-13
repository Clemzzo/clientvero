import Link from "next/link";

import { InvoiceNumber } from "@/components/invoices/InvoiceNumber";
import { paymentMethodIcons } from "@/components/invoices/payment-method-icons";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { paymentMethodLabels } from "@/features/invoices/payment-methods";
import { formatDate, formatMoney } from "@/lib/utils/format";
import type { PaymentLedgerRow } from "@/server/repositories/payment.repository";

type PaymentsTableProps = {
  payments: PaymentLedgerRow[];
  showClient?: boolean;
};

const headerCell = "px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-500";

function paidOn(payment: PaymentLedgerRow) {
  return formatDate(payment.paidAt.toISOString().slice(0, 10));
}

function InvoiceLink({ payment }: { payment: PaymentLedgerRow }) {
  return (
    <Link
      href={`/dashboard/invoices/${payment.invoiceId}`}
      className="rounded-md text-[14px] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <InvoiceNumber value={payment.invoiceNumber} />
    </Link>
  );
}

function ClientName({ payment }: { payment: PaymentLedgerRow }) {
  if (payment.clientArchived) {
    return (
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate text-[14px] font-medium text-ink-700">{payment.clientName}</span>
        <StatusBadge label="Archived" tone="neutral" />
      </span>
    );
  }

  return (
    <Link
      href={`/dashboard/clients/${payment.clientId}?tab=payments`}
      className="block truncate text-[14px] font-medium text-ink-900 hover:text-brand-700"
    >
      {payment.clientName}
    </Link>
  );
}

function Method({ payment }: { payment: PaymentLedgerRow }) {
  return (
    <span className="inline-flex items-center gap-2 text-[13.5px] text-ink-700">
      <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-md bg-mint-50 text-mint-600 [&_svg]:size-3.5">
        {paymentMethodIcons[payment.method]}
      </span>
      {paymentMethodLabels[payment.method]}
    </span>
  );
}

function Amount({ payment }: { payment: PaymentLedgerRow }) {
  return (
    <span className="font-display text-[15px] font-semibold tabular-nums text-ink-900">
      {formatMoney(payment.amount, payment.currency)}
    </span>
  );
}

export function PaymentsTable({ payments, showClient = true }: PaymentsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
      <table className="hidden w-full md:table">
        <caption className="sr-only">Recorded payments, newest first</caption>
        <thead className="border-b border-ink-200 bg-ink-50">
          <tr>
            <th scope="col" className={headerCell}>Date</th>
            {showClient && <th scope="col" className={headerCell}>Client</th>}
            <th scope="col" className={headerCell}>Invoice</th>
            <th scope="col" className={headerCell}>Method</th>
            <th scope="col" className={headerCell}>Reference</th>
            <th scope="col" className={headerCell}>Recorded by</th>
            <th scope="col" className={`${headerCell} text-right`}>Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-200">
          {payments.map((payment) => (
            <tr key={payment.id} className="transition-colors hover:bg-ink-50">
              <td className="whitespace-nowrap px-4 py-3 text-[13.5px] tabular-nums text-ink-700">{paidOn(payment)}</td>
              {showClient && (
                <td className="max-w-56 px-4 py-3">
                  <ClientName payment={payment} />
                </td>
              )}
              <td className="whitespace-nowrap px-4 py-3">
                <InvoiceLink payment={payment} />
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <Method payment={payment} />
              </td>
              <td className="max-w-56 px-4 py-3 text-[13.5px]">
                <span className="block truncate text-ink-700">{payment.reference ?? "—"}</span>
                {payment.note && <span className="block truncate text-[12.5px] text-ink-500">{payment.note}</span>}
              </td>
              <td className="max-w-40 truncate px-4 py-3 text-[13.5px] text-ink-500">{payment.recordedByName ?? "—"}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <Amount payment={payment} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-ink-200 md:hidden">
        {payments.map((payment) => (
          <li key={payment.id} className="space-y-1.5 px-4 py-3.5">
            <div className="flex items-baseline justify-between gap-3">
              <InvoiceLink payment={payment} />
              <Amount payment={payment} />
            </div>
            {showClient && <ClientName payment={payment} />}
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-500">
              <Method payment={payment} />
              <span aria-hidden>·</span>
              <span className="tabular-nums">{paidOn(payment)}</span>
              {payment.reference && (
                <>
                  <span aria-hidden>·</span>
                  <span>Ref {payment.reference}</span>
                </>
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
