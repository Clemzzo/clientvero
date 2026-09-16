import type { ReactNode } from "react";
import Image from "next/image";
import { Check, FileText, ReceiptText } from "lucide-react";

import sarahAvatar from "@/assets/images/sarah.png";
import { StatusPill } from "@/components/marketing/feature-previews";
import { cn } from "@/lib/utils";

const milestones = [
  { name: "Discovery", done: true },
  { name: "Moodboard", done: true },
  { name: "Logo concepts", done: true },
  { name: "Brand guidelines", done: false },
  { name: "Final files", done: false },
];

const files = [
  { name: "logo-concepts.pdf", size: "4.1 MB" },
  { name: "moodboard.pdf", size: "2.4 MB" },
];

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-3.5">
      <p className="text-[11.5px] font-semibold text-ink-900">{title}</p>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

export function PortalPreview() {
  const completed = milestones.filter((milestone) => milestone.done).length;
  const progress = Math.round((completed / milestones.length) * 100);

  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl bg-white shadow-[0_40px_90px_-30px_rgba(0,0,0,0.55)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-ink-200 px-4 py-3">
        <span className="flex min-w-0 items-center gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-ink-900 text-[10px] font-bold text-white">
            AS
          </span>
          <span className="truncate text-[12px] font-semibold text-ink-900">Acme Studio</span>
        </span>
        <span className="shrink-0 text-[10.5px] text-ink-400">Lumen Labs portal</span>
      </div>

      <div className="space-y-3 bg-ink-50 p-4">
        <div>
          <p className="font-display text-[17px] font-bold text-ink-900">Welcome back, James</p>
          <p className="mt-0.5 text-[11px] text-ink-500">Here&rsquo;s where your project stands.</p>
        </div>

        <Panel title="Brand identity">
          <div className="flex items-center gap-2.5">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
              <span className="block h-full rounded-full bg-brand-600" style={{ width: `${progress}%` }} />
            </span>
            <span className="shrink-0 text-[10.5px] font-semibold text-ink-500">{progress}%</span>
          </div>

          <ul className="mt-3 flex flex-wrap gap-1.5">
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
        </Panel>

        <div className="grid gap-3 sm:grid-cols-2">
          <Panel title="Invoices">
            <div className="flex items-center gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-amber-50 text-amber-600">
                <ReceiptText className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-medium text-ink-900">INV-0043</span>
                <span className="block truncate text-[10px] text-ink-400">Due May 12</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-[11px] font-semibold tabular-nums text-ink-900">$2,700.00</span>
                <StatusPill tone="amber">Sent</StatusPill>
              </span>
            </div>
          </Panel>

          <Panel title="Files">
            <ul className="space-y-1.5">
              {files.map((file) => (
                <li key={file.name} className="flex items-center gap-2 text-[10.5px]">
                  <FileText className="size-3.5 shrink-0 text-brand-600" />
                  <span className="min-w-0 flex-1 truncate text-ink-700">{file.name}</span>
                  <span className="shrink-0 text-ink-400">{file.size}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title="Messages">
          <div className="flex items-start gap-2.5">
            <Image src={sarahAvatar} alt="" sizes="28px" className="size-7 shrink-0 rounded-full object-cover" />
            <span className="min-w-0 flex-1 rounded-lg rounded-tl-sm bg-ink-50 px-2.5 py-2">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[11px] font-semibold text-ink-900">Sarah Chen</span>
                <span className="shrink-0 text-[10px] text-ink-400">2h ago</span>
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug text-ink-700">
                Logo concepts are ready. Let me know which direction you like best.
              </span>
            </span>
          </div>
        </Panel>
      </div>
    </div>
  );
}
