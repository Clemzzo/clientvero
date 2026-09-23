import { StatusPill, type Tone } from "@/components/marketing/feature-previews";
import { CheckItems, ProductSection } from "@/components/marketing/product/product-section";
import { cn } from "@/lib/utils";

const segments: { label: string; share: string; className: string }[] = [
  { label: "Paid", share: "w-1/3", className: "bg-emerald-500" },
  { label: "Sent", share: "w-1/3", className: "bg-brand-500" },
  { label: "Not invoiced", share: "w-1/3", className: "bg-ink-200" },
];

const invoices: { number: string; phase: string; amount: string; status: string; tone: Tone }[] = [
  { number: "INV-0021", phase: "Discovery", amount: "$4,500", status: "Paid", tone: "emerald" },
  { number: "INV-0022", phase: "Analysis", amount: "$4,500", status: "Sent", tone: "violet" },
];

const billingPoints = [
  "Invoices linked to the engagement they bill",
  "Record full or partial payments as they arrive",
  "Balance due updates as payments come in",
  "Overdue invoices are flagged for you",
];

function EngagementBillingMockup() {
  return (
    <div aria-hidden className="rounded-3xl bg-ink-100 p-4 sm:p-6">
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_24px_60px_-36px_rgba(7,11,24,0.35)]">
        <div className="px-5 pb-5 pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-[11.5px] text-ink-400">Operations review · Northwind Group</div>
              <div className="font-display text-[15px] font-bold text-ink-900">Engagement budget</div>
            </div>
            <span className="shrink-0 font-display text-[20px] font-bold tabular-nums tracking-[-0.02em] text-ink-900">
              $13,500
            </span>
          </div>

          <div className="mt-4 flex h-2.5 gap-1 overflow-hidden rounded-full">
            {segments.map((segment) => (
              <div key={segment.label} className={cn("h-full rounded-full", segment.share, segment.className)} />
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
            {segments.map((segment) => (
              <div key={segment.label} className="flex items-center gap-1.5 text-[11px] text-ink-500">
                <div className={cn("size-2 rounded-full", segment.className)} />
                {segment.label}
              </div>
            ))}
          </div>
        </div>

        <ul className="divide-y divide-ink-200 border-t border-ink-200">
          {invoices.map((invoice) => (
            <li key={invoice.number} className="flex items-center gap-3 px-5 py-3">
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-semibold tabular-nums text-ink-900">{invoice.number}</div>
                <div className="truncate text-[11px] text-ink-400">{invoice.phase} phase</div>
              </div>
              <StatusPill tone={invoice.tone}>{invoice.status}</StatusPill>
              <span className="w-16 shrink-0 text-right text-[12.5px] font-semibold tabular-nums text-ink-700">
                {invoice.amount}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-3 border-t border-ink-200 bg-ink-50 px-5 py-4">
          <span className="text-[12px] text-ink-500">Balance due</span>
          <span className="font-display text-[20px] font-bold tabular-nums tracking-[-0.02em] text-ink-900">
            $4,500
          </span>
        </div>
      </div>
    </div>
  );
}

export function ConsultantBilling() {
  return (
    <ProductSection
      id="billing"
      title="Bill each phase, see what's outstanding."
      intro="Invoice as each phase lands, and see at a glance what's paid, what's been sent, and what's still to bill."
      className="bg-ink-50"
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16">
        <div>
          <h3 className="text-[14px] font-semibold text-ink-900">Billing that follows the engagement</h3>
          <CheckItems items={billingPoints} className="mt-5" />

          <p className="mt-8 rounded-xl border border-ink-200 bg-white p-4 text-[13.5px] leading-normal text-ink-500">
            <span className="font-semibold text-ink-900">Paid the way you agree.</span> Clients pay you directly and
            you record it in ClientVero. Online invoice payments are on the way.
          </p>
        </div>

        <EngagementBillingMockup />
      </div>
    </ProductSection>
  );
}
