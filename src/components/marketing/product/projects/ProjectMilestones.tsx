import { GripVertical, Plus, Sparkles } from "lucide-react";

import { StatusPill, type Tone } from "@/components/marketing/feature-previews";
import { CheckItems, ProductSection } from "@/components/marketing/product/product-section";

const milestoneRules = [
  "Give each milestone a due date",
  "Put them in the order the work happens",
  "Move each one from Pending to Completed",
  "Progress updates as milestones are completed",
];

type MilestoneStatus = "Completed" | "In progress" | "Pending";

const statusTones: Record<MilestoneStatus, Tone> = {
  Completed: "emerald",
  "In progress": "brand",
  Pending: "ink",
};

const milestones: { name: string; status: MilestoneStatus; due: string }[] = [
  { name: "Discovery and sitemap", status: "Completed", due: "5 Sep" },
  { name: "Wireframes", status: "Completed", due: "16 Sep" },
  { name: "Visual design", status: "In progress", due: "2 Oct" },
  { name: "Content and copy", status: "Pending", due: "9 Oct" },
  { name: "Build and launch", status: "Pending", due: "18 Oct" },
];

function MilestonePlannerPreview() {
  return (
    <div aria-hidden className="rounded-3xl bg-ink-50 p-4 sm:p-8">
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_24px_60px_-36px_rgba(7,11,24,0.35)]">
        <div className="flex items-center justify-between gap-3 border-b border-ink-200 px-5 py-4">
          <div className="font-display text-[15px] font-bold text-ink-900">Milestones</div>
          <div className="flex h-8 items-center gap-1.5 rounded-lg border border-ink-200 px-3 text-[12px] font-semibold text-ink-700">
            <Plus className="size-3.5" />
            Add milestone
          </div>
        </div>

        <ol className="divide-y divide-ink-200">
          {milestones.map((milestone, index) => (
            <li key={milestone.name} className="flex items-center gap-3 px-5 py-3">
              <GripVertical className="size-3.5 shrink-0 text-ink-300" />
              <div className="w-4 shrink-0 text-[11px] tabular-nums text-ink-400">{index + 1}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-semibold text-ink-900">{milestone.name}</div>
                <div className="text-[11px] tabular-nums text-ink-400">Due {milestone.due}</div>
              </div>
              <StatusPill tone={statusTones[milestone.status]}>{milestone.status}</StatusPill>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-ink-200 bg-white p-4">
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-700">
          <Sparkles className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[12.5px] font-semibold text-ink-900">Suggest milestones</div>
          <div className="text-[11.5px] leading-normal text-ink-500">
            Draft a milestone plan from the project description, then edit it before you save.
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectMilestones() {
  return (
    <ProductSection
      id="milestones"
      title="Break the work into milestones."
      intro="Plan each project as a short list of milestones. Progress is worked out from the ones you've completed, so it's never a guess."
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16">
        <div>
          <h3 className="text-[14px] font-semibold text-ink-900">How milestones work</h3>
          <CheckItems items={milestoneRules} className="mt-5" />

          <p className="mt-8 rounded-xl border border-ink-200 p-4 text-[13.5px] leading-normal text-ink-500">
            <span className="font-semibold text-ink-900">Simple, honest progress.</span> Complete 3 of 5 milestones
            and the project shows 60%. No manual percentages to keep up to date.
          </p>
        </div>

        <MilestonePlannerPreview />
      </div>
    </ProductSection>
  );
}
