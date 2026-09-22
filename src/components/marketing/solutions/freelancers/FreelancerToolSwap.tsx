import { ArrowRight, FileText, FolderOpen, LayoutDashboard, ReceiptText, UserPlus, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ProductSection } from "@/components/marketing/product/product-section";

type Swap = { job: string; before: string; after: string; icon: LucideIcon };

const swaps: Swap[] = [
  { job: "Tracking new enquiries", before: "Spreadsheet", after: "Leads", icon: UserPlus },
  { job: "Writing proposals", before: "Google Docs", after: "Proposals", icon: FileText },
  { job: "Answering “where are we?”", before: "Emails, Slack, and Notion", after: "Client portal", icon: LayoutDashboard },
  { job: "Sharing files", before: "Drive links", after: "Portal files", icon: FolderOpen },
  { job: "Sending invoices", before: "Separate app", after: "Invoices", icon: ReceiptText },
  { job: "Knowing who's paid", before: "Memory", after: "Payment tracking", icon: Wallet },
];

function SwapRow({ swap }: { swap: Swap }) {
  return (
    <li className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-4 sm:px-6">
      <span className="text-[14px] font-semibold text-ink-900">{swap.job}</span>
      <span className="flex items-center gap-3 sm:contents">
        <span className="inline-flex w-fit items-center rounded-full bg-ink-100 px-3 py-1 text-[14px] text-ink-400 line-through decoration-ink-400/60">
          <span className="sr-only">Instead of </span>
          {swap.before}
        </span>
        <ArrowRight aria-hidden className="size-4 shrink-0 text-ink-400" />
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[12.5px] font-semibold text-brand-700">
          <swap.icon aria-hidden className="size-3.5" />
          <span className="sr-only">use </span>
          {swap.after}
        </span>
      </span>
    </li>
  );
}

export function FreelancerToolSwap() {
  return (
    <ProductSection
      id="swap"
      title="Swap the patchwork for one workspace."
      intro="Most freelancers run their business across five or six apps that don't talk to each other. ClientVero replaces the busywork, not the way you work."
      className="bg-ink-50"
    >
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_18px_40px_-32px_rgba(7,11,24,0.3)]">
        <div
          aria-hidden
          className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto_minmax(0,1fr)] gap-4 border-b border-ink-200 bg-ink-50 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400 sm:grid"
        >
          <span>The job</span>
          <span>Today</span>
          <span className="w-4" />
          <span>In ClientVero</span>
        </div>
        <ul className="divide-y divide-ink-200">
          {swaps.map((swap) => (
            <SwapRow key={swap.job} swap={swap} />
          ))}
        </ul>
      </div>
    </ProductSection>
  );
}
