import { Check, FolderKanban, LayoutDashboard, MessageSquare, Paperclip, ReceiptText } from "lucide-react";

import { ProgressFill } from "@/components/marketing/dashboard-motion";
import { StatusPill } from "@/components/marketing/feature-previews";
import { DocumentLinkBar } from "@/components/marketing/product/product-section";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Projects", icon: FolderKanban },
  { label: "Invoices", icon: ReceiptText },
  { label: "Files", icon: Paperclip },
  { label: "Messages", icon: MessageSquare, unread: 2 },
];

const milestones = [
  { name: "Discovery", done: true },
  { name: "Moodboard", done: true },
  { name: "Logo concepts", done: true },
  { name: "Brand guidelines", done: false },
  { name: "Final files", done: false },
];

export function PortalHomePreview() {
  const completed = milestones.filter((milestone) => milestone.done).length;
  const progress = Math.round((completed / milestones.length) * 100);

  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_40px_90px_-40px_rgba(7,11,24,0.35)]"
    >
      <DocumentLinkBar url="clientvero.com/portal" />

      <div className="flex items-center justify-between gap-3 border-b border-ink-200 px-4 py-3 sm:px-5">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-7 shrink-0 place-items-center rounded-md bg-brand-950 text-[10px] font-bold text-white">
            NS
          </span>
          <span className="truncate text-[12.5px] font-semibold text-ink-900">Northwind Studio</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="text-[11px] text-ink-400">Lumen Labs</span>
          <span className="grid size-6 place-items-center rounded-full bg-ink-100 text-[9.5px] font-bold text-ink-500">
            JM
          </span>
        </span>
      </div>

      <div className="grid sm:grid-cols-[148px_minmax(0,1fr)]">
        <ul className="hidden space-y-0.5 border-r border-ink-200 p-3 sm:block">
          {navItems.map((item) => (
            <li
              key={item.label}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11.5px]",
                item.active ? "bg-brand-50 font-semibold text-brand-700" : "text-ink-500",
              )}
            >
              <item.icon className="size-3.5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.unread && (
                <span className="grid size-4 place-items-center rounded-full bg-brand-600 text-[9px] font-bold text-white">
                  {item.unread}
                </span>
              )}
            </li>
          ))}
        </ul>

        <div className="space-y-3 bg-ink-50 p-4 sm:p-5">
          <div>
            <p className="font-display text-[18px] font-bold tracking-[-0.02em] text-ink-900">Welcome back, James</p>
            <p className="mt-0.5 text-[11px] text-ink-500">Here&rsquo;s where your project stands today.</p>
          </div>

          <div className="rounded-xl border border-ink-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold text-ink-900">Brand identity</span>
                <span className="block text-[11px] text-ink-400">
                  {completed} of {milestones.length} milestones complete
                </span>
              </span>
              <StatusPill tone="brand">In progress</StatusPill>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                <ProgressFill value={progress} className="bg-brand-600" />
              </span>
              <span className="shrink-0 text-[11px] font-semibold tabular-nums text-ink-700">{progress}%</span>
            </div>

            <ul className="mt-4 flex flex-wrap gap-1.5">
              {milestones.map((milestone) => (
                <li
                  key={milestone.name}
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]",
                    milestone.done
                      ? "border-brand-100 bg-brand-50 text-brand-700"
                      : "border-ink-200 bg-white text-ink-500",
                  )}
                >
                  {milestone.done && <Check className="size-2.5" strokeWidth={3} />}
                  {milestone.name}
                </li>
              ))}
            </ul>

            <p className="mt-4 border-t border-ink-100 pt-3 text-[11px] text-ink-500">
              Up next: <span className="font-semibold text-ink-900">Brand guidelines</span>, due 2 Oct
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-ink-200 bg-white p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-ink-400">Invoice due</span>
                <StatusPill tone="amber">Sent</StatusPill>
              </div>
              <p className="mt-1.5 font-display text-[16px] font-bold tabular-nums text-ink-900">
                $2,700.00 <span className="text-[10.5px] font-semibold text-ink-400">USD</span>
              </p>
              <p className="text-[10.5px] text-ink-400">INV-0043, due 24 Sep</p>
            </div>

            <div className="rounded-xl border border-ink-200 bg-white p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-ink-400">New files</span>
                <StatusPill tone="violet">2 new</StatusPill>
              </div>
              <p className="mt-1.5 truncate text-[12px] font-semibold text-ink-900">logo-concepts.pdf</p>
              <p className="truncate text-[10.5px] text-ink-400">and moodboard.pdf, shared today</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
