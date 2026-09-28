import { Check } from "lucide-react";

import { ProgressFill } from "@/components/marketing/dashboard-motion";
import { StatusPill } from "@/components/marketing/feature-previews";
import { cn } from "@/lib/utils";

const tabs =
 ["Overview", 
  "Milestones", 
  "Files", 
  "Messages", 
  "Activity"];

const details = [
  { label: "Budget", value: "$6,500.00 USD" },
  { label: "Started", value: "1 Sep" },
  { label: "Due", value: "18 Oct" },
];

const milestones = [
  { name: "Discovery and sitemap", due: "Done 5 Sep", done: true },
  { name: "Wireframes", due: "Done 16 Sep", done: true },
  { name: "Visual design", due: "Due 2 Oct", done: false },
  { name: "Build and launch", due: "Due 18 Oct", done: false },
];

export function ProjectOverviewPreview() {
  const completed = milestones.filter((milestone) => milestone.done).length;
  const progress = Math.round((completed / milestones.length) * 100);

  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_40px_90px_-40px_rgba(7,11,24,0.35)]"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-[12px] text-ink-400">BrightPath Studio</div>
            <div className="truncate font-display text-[18px] font-bold tracking-[-0.02em] text-ink-900">
              Website redesign
            </div>
          </div>
          <StatusPill tone="brand">In progress</StatusPill>
        </div>

        <div className="mt-5 flex gap-4 overflow-hidden border-b border-ink-200 text-[11.5px]">
          {tabs.map((tab, index) => (
            <div
              key={tab}
              className={cn(
                "-mb-px shrink-0 border-b-2 pb-2.5",
                index === 0 ? "border-brand-600 font-semibold text-ink-900" : "border-transparent text-ink-400",
              )}
            >
              {tab}
            </div>
          ))}
        </div>

        <dl className="mt-5 grid grid-cols-3 divide-x divide-ink-200 rounded-xl border border-ink-200">
          {details.map((detail) => (
            <div key={detail.label} className="min-w-0 px-3 py-3 sm:px-4">
              <dt className="truncate text-[10.5px] text-ink-400 sm:text-[11px]">{detail.label}</dt>
              <dd className="mt-1 truncate text-[12px] font-semibold tabular-nums text-ink-900 sm:text-[13px]">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex items-baseline justify-between gap-3 text-[11.5px]">
          <div className="text-ink-500">
            <span className="font-semibold tabular-nums text-ink-900">{completed}</span> of {milestones.length}{" "}
            milestones complete
          </div>
          <div className="font-semibold tabular-nums text-ink-700">{progress}%</div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
          <ProgressFill value={progress} className="bg-brand-600" />
        </div>
      </div>

      <ul className="divide-y divide-ink-200 border-t border-ink-200">
        {milestones.map((milestone) => (
          <li key={milestone.name} className="flex items-center gap-3 px-5 py-3 sm:px-6">
            <div
              className={cn(
                "grid size-5 shrink-0 place-items-center rounded-full",
                milestone.done ? "bg-emerald-500 text-white" : "border-2 border-ink-200 bg-white",
              )}
            >
              {milestone.done && <Check className="size-3" strokeWidth={3} />}
            </div>
            <div
              className={cn(
                "min-w-0 flex-1 truncate text-[12.5px]",
                milestone.done ? "text-ink-400 line-through" : "font-semibold text-ink-900",
              )}
            >
              {milestone.name}
            </div>
            <div className="shrink-0 text-[11px] tabular-nums text-ink-400">{milestone.due}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
