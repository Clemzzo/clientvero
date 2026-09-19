import { Plus } from "lucide-react";

import { StatusPill, type Tone } from "@/components/marketing/feature-previews";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Outstanding", value: "$8,400", detail: "3 invoices", alert: false },
  { label: "Overdue", value: "$900", detail: "1 invoice", alert: true },
  { label: "Paid this month", value: "$6,000", detail: "2 payments", alert: false },
];

const invoices: {
  number: string;
  client: string;
  due: string;
  amount: string;
  balance?: string;
  status: string;
  tone: Tone;
}[] = [
  { number: "INV-0044", client: "BrightPath", due: "2 Oct", amount: "$4,800", status: "Sent", tone: "brand" },
  {
    number: "INV-0043",
    client: "Lumen Labs",
    due: "24 Sep",
    amount: "$5,400",
    balance: "$2,700 due",
    status: "Partially paid",
    tone: "amber",
  },
  { number: "INV-0042", client: "Park & Co.", due: "12 Sep", amount: "$3,300", status: "Paid", tone: "emerald" },
  { number: "INV-0041", client: "Marco Silva", due: "5 Sep", amount: "$900", status: "Overdue", tone: "rose" },
];

const columns = "grid-cols-[minmax(0,1fr)_64px_96px] sm:grid-cols-[minmax(0,1fr)_56px_72px_96px]";

export function InvoiceDashboardPreview() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_40px_90px_-40px_rgba(7,11,24,0.35)]"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span>
            <span className="block font-display text-[18px] font-bold tracking-[-0.02em] text-ink-900">Invoices</span>
            <span className="block text-[11.5px] text-ink-400">September</span>
          </span>
          <span className="flex h-8 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-[12px] font-semibold text-white">
            <Plus className="size-3.5" />
            New invoice
          </span>
        </div>

        <dl className="mt-5 grid grid-cols-3 divide-x divide-ink-200 rounded-xl border border-ink-200">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-0 px-3 py-3 sm:px-4">
              <dt className="flex items-center gap-1.5 truncate text-[10.5px] text-ink-400 sm:text-[11px]">
                {stat.alert && <span className="size-1.5 shrink-0 rounded-full bg-rose-500" />}
                {stat.label}
              </dt>
              <dd className="mt-1 font-display text-[17px] font-bold tabular-nums tracking-[-0.02em] text-ink-900 sm:text-[20px]">
                {stat.value}
              </dd>
              <dd className={cn("text-[10.5px]", stat.alert ? "text-rose-600" : "text-ink-400")}>{stat.detail}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={cn("grid gap-3 border-y border-ink-200 bg-ink-50 px-5 py-2 text-[10.5px] text-ink-400 sm:px-6", columns)}>
        <span>Invoice</span>
        <span className="hidden sm:block">Due</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Status</span>
      </div>

      <ul className="divide-y divide-ink-200">
        {invoices.map((invoice) => (
          <li key={invoice.number} className={cn("grid items-center gap-3 px-5 py-3 sm:px-6", columns)}>
            <span className="min-w-0">
              <span className="block truncate text-[12.5px] font-semibold tabular-nums text-ink-900">
                {invoice.number}
              </span>
              <span className="block truncate text-[11px] text-ink-400">{invoice.client}</span>
            </span>
            <span
              className={cn(
                "hidden text-[11.5px] sm:block",
                invoice.tone === "rose" ? "font-medium text-rose-600" : "text-ink-500",
              )}
            >
              {invoice.due}
            </span>
            <span className="text-right">
              <span className="block font-display text-[13px] font-bold tabular-nums text-ink-900">
                {invoice.amount}
              </span>
              {invoice.balance && <span className="block text-[10.5px] text-ink-400">{invoice.balance}</span>}
            </span>
            <span className="flex justify-end">
              <StatusPill tone={invoice.tone}>{invoice.status}</StatusPill>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
