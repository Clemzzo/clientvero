import { Check } from "lucide-react";

import { DocumentLinkBar } from "@/components/marketing/product/product-section";
import { cn } from "@/lib/utils";

const sections = ["Introduction", "Scope", "Deliverables", "Timeline", "Pricing", "Terms"];
const activeSection = "Pricing";

const lineItems = [
  { description: "Discovery and strategy", note: "Research, goals, and sitemap", amount: "$600.00" },
  { description: "Visual design", note: "Homepage and six inner pages", amount: "$1,400.00" },
  { description: "Development and launch", note: "Build, testing, and go-live", amount: "$1,200.00" },
];

const adjustments = [
  { label: "Subtotal", amount: "$3,200.00" },
  { label: "Discount", amount: "−$200.00" },
  { label: "Tax (10%)", amount: "$300.00" },
];

export function ProposalDocumentPreview() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_40px_90px_-40px_rgba(7,11,24,0.35)]"
    >
      <DocumentLinkBar url="clientvero.com/proposal/7Kq2xR9mT" />

      <div className="px-5 pb-5 pt-5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-brand-950 text-[10px] font-bold text-white">
              NS
            </span>
            <span className="truncate text-[12.5px] font-semibold text-ink-900">Northwind Studio</span>
          </span>
          <span className="shrink-0 text-[11px] text-ink-400">Valid until 30 Oct</span>
        </div>

        <p className="mt-6 text-[11.5px] text-ink-400">Proposal for Park &amp; Co.</p>
        <p className="mt-1 font-display text-[24px] font-extrabold leading-tight tracking-[-0.03em] text-ink-900">
          Website redesign
        </p>
      </div>

      <div className="grid border-t border-ink-200 sm:grid-cols-[136px_minmax(0,1fr)]">
        <ol className="hidden border-r border-ink-200 py-4 sm:block">
          {sections.map((section) => (
            <li
              key={section}
              className={cn(
                "border-l-2 px-4 py-1.5 text-[11.5px]",
                section === activeSection
                  ? "border-brand-600 font-semibold text-ink-900"
                  : "border-transparent text-ink-400",
              )}
            >
              {section}
            </li>
          ))}
        </ol>

        <div className="p-5 sm:p-6">
          <p className="text-[13px] font-semibold text-ink-900">Pricing</p>

          <ul className="mt-3 divide-y divide-ink-100">
            {lineItems.map((item) => (
              <li key={item.description} className="flex items-start justify-between gap-4 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-medium text-ink-900">{item.description}</span>
                  <span className="block truncate text-[11px] text-ink-400">{item.note}</span>
                </span>
                <span className="shrink-0 text-[12px] tabular-nums text-ink-700">{item.amount}</span>
              </li>
            ))}
          </ul>

          <dl className="ml-auto mt-2 max-w-60 space-y-1.5 border-t border-ink-200 pt-3">
            {adjustments.map((row) => (
              <div key={row.label} className="flex justify-between gap-4 text-[11.5px] text-ink-500">
                <dt>{row.label}</dt>
                <dd className="tabular-nums">{row.amount}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-ink-200 bg-ink-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>
          <span className="block text-[11px] text-ink-400">Total</span>
          <span className="block font-display text-[20px] font-extrabold tabular-nums tracking-[-0.02em] text-ink-900">
            $3,300.00 <span className="text-[12px] font-semibold text-ink-400">USD</span>
          </span>
        </span>
        <span className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 sm:flex">
          <span className="flex h-10 items-center justify-center rounded-lg border border-ink-200 bg-white px-4 text-[13px] font-semibold text-ink-700">
            Decline
          </span>
          <span className="flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 text-[13px] font-semibold text-white">
            <Check className="size-4" />
            Accept proposal
          </span>
        </span>
      </div>
    </div>
  );
}
