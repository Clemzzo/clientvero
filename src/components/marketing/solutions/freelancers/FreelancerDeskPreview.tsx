import { CircleCheck, Eye, Flag } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ProgressFill } from "@/components/marketing/dashboard-motion";
import { StatusPill, type Tone } from "@/components/marketing/feature-previews";

const stats = [
  { label: "Active clients", value: "4" },
  { label: "Proposals out", value: "2" },
  { label: "Outstanding", value: "$3,450" },
];

const today: { title: string; detail: string; status: string; tone: Tone; icon: LucideIcon }[] = [
  { title: "Lumen Labs viewed your proposal", detail: "Brand identity · 10:24am", status: "Viewed", tone: "violet", icon: Eye },
  { title: "INV-0014 paid in full", detail: "Park & Co. · $1,200", status: "Paid", tone: "emerald", icon: CircleCheck },
  { title: "Homepage design due Friday", detail: "BrightPath · Website", status: "Due soon", tone: "amber", icon: Flag },
];

export function FreelancerDeskPreview() {
  return (
    <div aria-hidden className="rounded-3xl bg-ink-100 p-4 sm:p-6">
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_24px_60px_-36px_rgba(7,11,24,0.35)]">
        <div className="flex items-center justify-between gap-3 border-b border-ink-200 px-5 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-600 text-[12px] font-bold text-white">
              MR
            </div>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-semibold text-ink-900">Maya Reyes Studio</div>
              <div className="truncate text-[12px] text-ink-400">Your week at a glance</div>
            </div>
          </div>
          <StatusPill tone="brand">Solo</StatusPill>
        </div>

        <div className="grid grid-cols-3 divide-x divide-ink-200 border-b border-ink-200">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-0 px-4 py-3.5 sm:px-5">
              <div className="truncate text-[10.5px] text-ink-400">{stat.label}</div>
              <div className="mt-1 font-display text-[18px] font-bold tabular-nums tracking-[-0.02em] text-ink-900">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">Today</p>
          <ul className="mt-3 space-y-2">
            {today.map((item) => (
              <li
                key={item.title}
                className="flex items-center gap-3 rounded-xl border border-ink-200 px-3 py-2.5"
              >
                <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <item.icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-semibold text-ink-900">{item.title}</div>
                  <div className="truncate text-[10.5px] text-ink-400">{item.detail}</div>
                </div>
                <StatusPill tone={item.tone}>{item.status}</StatusPill>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-ink-200 bg-ink-50 px-5 py-4">
          <div className="flex items-baseline justify-between gap-3 text-[11.5px]">
            <span className="min-w-0 truncate">
              <span className="font-semibold text-ink-900">Website redesign</span>
              <span className="text-ink-400"> · BrightPath</span>
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-ink-700">60%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-200">
            <ProgressFill value={60} className="bg-brand-600" />
          </div>
          <p className="mt-2 text-[10.5px] text-ink-400">3 of 5 milestones complete · visible in their portal</p>
        </div>
      </div>
    </div>
  );
}
