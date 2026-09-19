import { Check, Eye, Send } from "lucide-react";

import { StatusPill } from "@/components/marketing/feature-previews";
import { CheckList, ProductSection } from "@/components/marketing/product/product-section";
import { cn } from "@/lib/utils";

const recording = [
  "Record full or partial payments",
  "Add a reference, like a transfer ID",
  "See every payment on the invoice",
];

const accuracy = [
  "The amount due updates straight away",
  "Status moves to Partially paid or Paid",
  "Overdue invoices are flagged for you",
];

const history = [
  { date: "18 Sep", event: "Payment recorded", detail: "Bank transfer, ref LL-2291", amount: "$2,700.00", icon: Check },
  { date: "11 Sep", event: "Viewed by Lumen Labs", icon: Eye },
  { date: "10 Sep", event: "Invoice sent", icon: Send },
];

function PaymentHistoryPreview() {
  return (
    <div aria-hidden className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
      <div className="rounded-xl bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold tabular-nums text-ink-900">INV-0043</span>
            <span className="block truncate text-[11px] text-ink-400">Lumen Labs</span>
          </span>
          <StatusPill tone="amber">Partially paid</StatusPill>
        </div>

        <div className="mt-5 flex items-baseline justify-between gap-3 text-[11.5px]">
          <span className="text-ink-500">
            <span className="font-semibold tabular-nums text-ink-900">$2,700</span> of $5,400 paid
          </span>
          <span className="font-semibold tabular-nums text-ink-500">50%</span>
        </div>
        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-ink-100">
          <span className="block h-full w-1/2 rounded-full bg-emerald-500" />
        </span>

        <p className="mt-6 text-[11.5px] font-semibold text-ink-900">Payment history</p>
        <ol className="mt-3 space-y-3">
          {history.map((entry, index) => (
            <li key={entry.event} className="flex items-start gap-3">
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full",
                  index === 0 ? "bg-emerald-500 text-white" : "bg-ink-100 text-ink-500",
                )}
              >
                <entry.icon className="size-3" strokeWidth={2.5} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-medium text-ink-900">{entry.event}</span>
                <span className="block truncate text-[11px] text-ink-400">
                  {entry.detail ? `${entry.date}, ${entry.detail}` : entry.date}
                </span>
              </span>
              {entry.amount && (
                <span className="shrink-0 text-[12px] font-semibold tabular-nums text-emerald-700">{entry.amount}</span>
              )}
            </li>
          ))}
        </ol>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink-200 pt-4">
          <span>
            <span className="block text-[11px] text-ink-400">Amount due</span>
            <span className="block font-display text-[17px] font-bold tabular-nums text-ink-900">$2,700.00</span>
          </span>
          <span className="flex h-9 items-center rounded-lg bg-brand-600 px-4 text-[12.5px] font-semibold text-white">
            Record payment
          </span>
        </div>
      </div>
    </div>
  );
}

export function InvoicePayments() {
  return (
    <ProductSection
      id="payments"
      title="Record a payment, and the balance keeps up."
      intro="Your client pays using the details on the invoice. Record the payment in a few seconds, and the invoice updates everywhere."
      dark
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="grid gap-8 sm:grid-cols-2">
          <CheckList title="Record a payment" items={recording} />
          <CheckList title="Stay accurate" items={accuracy} />
        </div>
        <PaymentHistoryPreview />
      </div>
    </ProductSection>
  );
}
