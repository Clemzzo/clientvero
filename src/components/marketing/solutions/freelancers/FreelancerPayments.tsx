import { Check } from "lucide-react";

import { StatusPill, type Tone } from "@/components/marketing/feature-previews";
import { ProductSection } from "@/components/marketing/product/product-section";

const paymentPoints = [
  "See every invoice's status at a glance",
  "Record full or partial payments as they arrive",
  "Outstanding balances update on their own",
  "Overdue invoices stand out before you have to ask",
];

const invoices: { number: string; client: string; amount: string; status: string; tone: Tone }[] = [
  { number: "INV-0015", client: "BrightPath", amount: "$2,400", status: "Sent", tone: "brand" },
  { number: "INV-0014", client: "Park & Co.", amount: "$1,200", status: "Paid", tone: "emerald" },
  { number: "INV-0013", client: "Lumen Labs", amount: "$1,800", status: "Partially paid", tone: "violet" },
  { number: "INV-0012", client: "Marco Silva", amount: "$450", status: "Overdue", tone: "rose" },
];

function InvoiceLedgerPreview() {
  return (
    <div aria-hidden className="rounded-3xl bg-ink-50 p-4 sm:p-8">
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_24px_60px_-36px_rgba(7,11,24,0.35)]">
        <div className="flex items-center justify-between gap-3 border-b border-ink-200 px-5 py-4">
          <span className="font-display text-[15px] font-bold text-ink-900">Invoices</span>
          <span className="text-[11px] text-ink-400">This month</span>
        </div>

        <ul className="divide-y divide-ink-200">
          {invoices.map((invoice) => (
            <li key={invoice.number} className="flex items-center gap-3 px-5 py-3">
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-semibold tabular-nums text-ink-900">{invoice.number}</span>
                <span className="block truncate text-[11px] text-ink-400">{invoice.client}</span>
              </span>
              <StatusPill tone={invoice.tone}>{invoice.status}</StatusPill>
              <span className="w-16 shrink-0 text-right text-[12.5px] font-semibold tabular-nums text-ink-700">
                {invoice.amount}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-3 border-t border-ink-200 bg-ink-50 px-5 py-4">
          <span className="text-[12px] text-ink-500">Outstanding</span>
          <span className="font-display text-[20px] font-bold tabular-nums tracking-[-0.02em] text-ink-900">
            $3,450
          </span>
        </div>
      </div>
    </div>
  );
}

export function FreelancerPayments() {
  return (
    <ProductSection
      id="payments"
      title="Know who owes you, without a spreadsheet."
      intro="Send invoices from the same place you run the project, and always know what's paid, what's due, and what's late."
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16">
        <div>
          <h3 className="text-[14px] font-semibold text-ink-900">Stay on top of cash flow</h3>
          <ul className="mt-5 space-y-3.5">
            {paymentPoints.map((point) => (
              <li key={point} className="flex items-center gap-2.5 text-[14px] text-ink-700">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <Check aria-hidden className="size-3" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <p className="mt-8 rounded-xl border border-ink-200 p-4 text-[13.5px] leading-normal text-ink-500">
            <span className="font-semibold text-ink-900">Paid your way.</span> Clients pay you however you already
            agree, and you record it in ClientVero. Online invoice payments are on the way.
          </p>
        </div>

        <InvoiceLedgerPreview />
      </div>
    </ProductSection>
  );
}
