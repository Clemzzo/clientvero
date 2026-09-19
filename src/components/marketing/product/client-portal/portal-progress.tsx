import { Check } from "lucide-react";

import { ProgressFill } from "@/components/marketing/dashboard-motion";
import { StatusPill, type Tone } from "@/components/marketing/feature-previews";
import { ProductSection } from "@/components/marketing/product/product-section";
import { cn } from "@/lib/utils";

const progressRules = [
  "Progress is worked out from completed milestones",
  "Each milestone shows its status and due date",
  "Mark a milestone done and your client sees it straight away",
  "The project's status tells them what stage it's at",
];

type MilestoneStatus = "Completed" | "In progress" | "Pending";

const statusTones: Record<MilestoneStatus, Tone> = {
  Completed: "emerald",
  "In progress": "brand",
  Pending: "ink",
};

const milestones: { name: string; status: MilestoneStatus; date: string }[] = [
  { name: "Discovery", status: "Completed", date: "Done 3 Sep" },
  { name: "Moodboard", status: "Completed", date: "Done 10 Sep" },
  { name: "Logo concepts", status: "Completed", date: "Done 18 Sep" },
  { name: "Brand guidelines", status: "In progress", date: "Due 2 Oct" },
  { name: "Final files", status: "Pending", date: "Due 9 Oct" },
];

function MilestoneDot({ status }: { status: MilestoneStatus }) {
  if (status === "Completed") {
    return (
      <span className="relative grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500 text-white ring-4 ring-white">
        <Check className="size-3" strokeWidth={3} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "relative grid size-5 shrink-0 place-items-center rounded-full border-2 bg-white ring-4 ring-white",
        status === "In progress" ? "border-brand-600" : "border-ink-200",
      )}
    >
      {status === "In progress" && <span className="size-2 rounded-full bg-brand-600" />}
    </span>
  );
}

function MilestoneTimelinePreview() {
  const completed = milestones.filter((milestone) => milestone.status === "Completed").length;
  const progress = Math.round((completed / milestones.length) * 100);

  return (
    <div aria-hidden className="rounded-3xl bg-ink-50 p-4 sm:p-8">
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_24px_60px_-36px_rgba(7,11,24,0.35)]">
        <div className="border-b border-ink-200 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <span className="min-w-0">
              <span className="block truncate text-[11px] text-ink-400">Lumen Labs</span>
              <span className="block truncate font-display text-[16px] font-bold text-ink-900">Brand identity</span>
            </span>
            <StatusPill tone="brand">In progress</StatusPill>
          </div>

          <div className="mt-4 flex items-baseline justify-between gap-3 text-[11.5px]">
            <span className="text-ink-500">
              <span className="font-semibold tabular-nums text-ink-900">{completed}</span> of {milestones.length}{" "}
              milestones complete
            </span>
            <span className="font-semibold tabular-nums text-ink-700">{progress}%</span>
          </div>
          <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-ink-100">
            <ProgressFill value={progress} className="bg-brand-600" />
          </span>
        </div>

        <ol className="px-5 py-5">
          {milestones.map((milestone, index) => (
            <li key={milestone.name} className="relative flex items-start gap-3.5 pb-5 last:pb-0">
              {index < milestones.length - 1 && (
                <span
                  className={cn(
                    "absolute bottom-0 left-2.25 top-5 w-0.5",
                    milestone.status === "Completed" ? "bg-emerald-200" : "bg-ink-100",
                  )}
                />
              )}
              <MilestoneDot status={milestone.status} />
              <span className="flex min-w-0 flex-1 items-start justify-between gap-3">
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block truncate text-[12.5px] font-semibold",
                      milestone.status === "Pending" ? "text-ink-500" : "text-ink-900",
                    )}
                  >
                    {milestone.name}
                  </span>
                  <span className="block text-[11px] text-ink-400">{milestone.date}</span>
                </span>
                <StatusPill tone={statusTones[milestone.status]}>{milestone.status}</StatusPill>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function PortalProgress() {
  return (
    <ProductSection
      id="progress"
      title="Progress your client can follow."
      intro="Break each project into milestones. As you complete them, your client watches the project move forward, without having to ask."
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16">
        <div>
          <h3 className="text-[14px] font-semibold text-ink-900">How progress works</h3>
          <ul className="mt-5 space-y-3.5">
            {progressRules.map((rule) => (
              <li key={rule} className="flex items-center gap-2.5 text-[14px] text-ink-700">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <Check aria-hidden className="size-3" strokeWidth={3} />
                </span>
                {rule}
              </li>
            ))}
          </ul>

          <p className="mt-8 rounded-xl border border-ink-200 p-4 text-[13.5px] leading-normal text-ink-500">
            <span className="font-semibold text-ink-900">Fewer status emails.</span> Your client checks the portal
            instead of their inbox, and you spend that time on the work.
          </p>
        </div>

        <MilestoneTimelinePreview />
      </div>
    </ProductSection>
  );
}
