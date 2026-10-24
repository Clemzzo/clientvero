import type { ReactNode } from "react";

import { WorkspaceLogo } from "@/components/shared/WorkspaceLogo";
import type { InvoiceDocumentData, InvoiceParty } from "@/features/invoices/invoice-document";
import { formatQuantity } from "@/features/invoices/quantity";
import { cn } from "@/lib/utils";
import { formatDate, formatMoney } from "@/lib/utils/format";
import { isZeroAmount } from "@/lib/utils/money";

import { InvoiceNumber } from "./InvoiceNumber";

type InvoiceDocumentProps = {
  invoice: InvoiceDocumentData;
  compact?: boolean;
  className?: string;
};

function Party({ label, party }: { label?: string; party: InvoiceParty }) {
  return (
    <div className="min-w-0">
      {label && <p className="text-[12.5px] text-ink-500">{label}</p>}
      <p className="mt-0.5 font-semibold text-ink-900">{party.name || "Choose a client"}</p>
      {party.lines.map((line) => (
        <p key={line} className="whitespace-pre-line break-words text-ink-500">
          {line}
        </p>
      ))}
    </div>
  );
}

function TotalRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-6", strong && "font-semibold text-ink-900")}>
      <dt className={strong ? undefined : "text-ink-500"}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

function Block({ title, children, accent }: { title: string; children: ReactNode; accent?: boolean }) {
  return (
    <section className={cn("break-inside-avoid", accent && "border-l-[3px] border-grape-500 pl-4")}>
      <h3 className="font-semibold text-ink-900">{title}</h3>
      <div className="mt-1 whitespace-pre-line break-words text-ink-700">{children}</div>
    </section>
  );
}

export function InvoiceDocument({ invoice, compact = false, className }: InvoiceDocumentProps) {
  const money = (amount: string) => formatMoney(amount, invoice.currency);
  const hasDiscount = !isZeroAmount(invoice.discount);
  const hasPayments = !isZeroAmount(invoice.amountPaid);

  return (
    <article
      aria-label={`Invoice ${invoice.invoiceNumber}`}
      className={cn(
        "rounded-[4px] border border-ink-200 bg-white text-ink-700 shadow-[0_28px_56px_-32px_rgba(7,11,24,0.32)] print:border-0 print:shadow-none",
        compact ? "space-y-5 p-5 text-[11.5px] leading-[1.5]" : "space-y-9 p-6 text-[14px] leading-[1.6] sm:p-10",
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
        <div className="min-w-0 max-w-[60%]">
          {invoice.business.logo && (
            <WorkspaceLogo
              name={invoice.business.name}
              src={invoice.business.logo}
              className={cn("mb-3 rounded-md", compact ? "size-8" : "size-12")}
            />
          )}
          <p className={cn("font-display font-bold tracking-[-0.02em] text-ink-900", compact ? "text-[15px]" : "text-[22px]")}>
            {invoice.business.name}
          </p>
          {invoice.business.lines.map((line) => (
            <p key={line} className="whitespace-pre-line break-words text-ink-500">
              {line}
            </p>
          ))}
        </div>
        <div className="text-right">
          <p className="text-ink-500">Invoice</p>
          <InvoiceNumber value={invoice.invoiceNumber} className={compact ? "text-[16px]" : "text-[26px]"} />
        </div>
      </header>

      <div className={cn("grid gap-x-8 gap-y-4", compact ? "grid-cols-[1fr_auto_auto]" : "sm:grid-cols-[1fr_auto_auto]")}>
        <Party label="Billed to" party={invoice.client} />
        <div>
          <p className="text-[12.5px] text-ink-500">Issued</p>
          <p className="mt-0.5 font-medium text-ink-900">{formatDate(invoice.issueDate)}</p>
        </div>
        <div>
          <p className="text-[12.5px] text-ink-500">Due</p>
          <p className="mt-0.5 font-medium text-ink-900">{formatDate(invoice.dueDate)}</p>
        </div>
      </div>

      <table className="w-full table-fixed border-collapse">
        <caption className="sr-only">Invoice lines</caption>
        <thead>
          <tr className="border-b border-ink-900/80 text-left text-[12.5px] text-ink-500">
            <th scope="col" className="pb-2 font-medium">
              Description
            </th>
            <th scope="col" className={cn("pb-2 text-right font-medium", compact ? "w-10" : "w-16")}>
              Qty
            </th>
            <th scope="col" className={cn("pb-2 text-right font-medium", compact ? "w-20" : "w-28")}>
              Price
            </th>
            <th scope="col" className={cn("pb-2 text-right font-medium", compact ? "w-22" : "w-32")}>
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index} className="border-b border-ink-200 align-top">
              <td className="whitespace-pre-line break-words py-2.5 pr-3 text-ink-900">{item.description || "Untitled line"}</td>
              <td className="py-2.5 text-right tabular-nums">{formatQuantity(item.quantity)}</td>
              <td className="py-2.5 text-right tabular-nums">{money(item.unitPrice)}</td>
              <td className="py-2.5 text-right font-medium tabular-nums text-ink-900">{money(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className={cn("ml-auto space-y-1.5", compact ? "w-full max-w-56" : "w-full max-w-72")}>
        <TotalRow label="Subtotal" value={money(invoice.subtotal)} />
        {hasDiscount && <TotalRow label="Discount" value={`−${money(invoice.discount)}`} />}
        <TotalRow label="Total" value={money(invoice.total)} strong />
        {hasPayments && (
          <>
            <TotalRow label="Paid" value={`−${money(invoice.amountPaid)}`} />
            <div className="flex items-baseline justify-between gap-6 border-t border-ink-900/80 pt-2">
              <dt className="font-semibold text-ink-900">Amount due</dt>
              <dd className={cn("font-display font-bold tabular-nums text-ink-900", compact ? "text-[15px]" : "text-[20px]")}>
                {money(invoice.amountDue)}
              </dd>
            </div>
          </>
        )}
      </dl>

      {(invoice.notes || invoice.paymentInstructions) && (
        <div className="space-y-6">
          {invoice.paymentInstructions && (
            <Block title="How to pay" accent>
              {invoice.paymentInstructions}
            </Block>
          )}
          {invoice.notes && <Block title="Note">{invoice.notes}</Block>}
        </div>
      )}
    </article>
  );
}
