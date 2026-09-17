import Image from "next/image";
import { Globe } from "lucide-react";

import oliviaAvatar from "@/assets/images/olivia.png";
import tomAvatar from "@/assets/images/tom.png";
import { StatusPill } from "@/components/marketing/feature-previews";
import { cn } from "@/lib/utils";

const tabs = ["Overview", "Projects", "Invoices", "Files"];

const stats = [
  { label: "Active projects", value: "1" },
  { label: "Outstanding", value: "$1,200 USD" },
];

export function ClientRecordPreview() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_40px_90px_-40px_rgba(7,11,24,0.35)]"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-[13px] font-bold text-white">
              PC
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-[16px] font-bold text-ink-900">Park &amp; Co.</span>
              <span className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-ink-500">
                <Globe className="size-3.5 shrink-0" />
                parkandco.com
              </span>
            </span>
          </div>
          <StatusPill tone="brand">Portal invited</StatusPill>
        </div>

        <div className="mt-5 flex gap-4 overflow-hidden border-b border-ink-200 text-[12px]">
          {tabs.map((tab, index) => (
            <span
              key={tab}
              className={cn(
                "-mb-px shrink-0 border-b-2 pb-2",
                index === 0 ? "border-brand-600 font-semibold text-ink-900" : "border-transparent text-ink-400",
              )}
            >
              {tab}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-5 bg-ink-50 p-5">
        <dl className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-ink-200 bg-white px-3 py-2.5">
              <dt className="text-[10.5px] text-ink-400">{stat.label}</dt>
              <dd className="mt-0.5 font-display text-[16px] font-bold text-ink-900">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <div>
          <p className="text-[11.5px] font-semibold text-ink-900">Contacts</p>
          <ul className="mt-2.5 space-y-2">
            <li className="flex items-center gap-2.5 rounded-lg border border-ink-200 bg-white px-3 py-2">
              <Image src={oliviaAvatar} alt="" sizes="32px" className="size-8 shrink-0 rounded-full object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-semibold text-ink-900">Olivia Park</span>
                <span className="block truncate text-[11px] text-ink-400">Founder</span>
              </span>
              <StatusPill tone="emerald">Primary</StatusPill>
            </li>
            <li className="flex items-center gap-2.5 rounded-lg border border-ink-200 bg-white px-3 py-2">
              <Image src={tomAvatar} alt="" sizes="32px" className="size-8 shrink-0 rounded-full object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-semibold text-ink-900">Tom Reyes</span>
                <span className="block truncate text-[11px] text-ink-400">Finance</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
