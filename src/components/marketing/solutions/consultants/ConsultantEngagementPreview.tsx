import Image from "next/image";
import { Check, ReceiptText } from "lucide-react";

import holandAvatar from "@/assets/images/holand.png";
import jamesAvatar from "@/assets/images/james.png";
import mikeAvatar from "@/assets/images/mike.png";
import { ProgressFill } from "@/components/marketing/dashboard-motion";
import { StatusPill } from "@/components/marketing/feature-previews";
import { cn } from "@/lib/utils";

type PhaseState = "done" | "active" | "pending";

const stakeholders = [
  { name: "James Carter", avatar: jamesAvatar },
  { name: "Holand Brooks", avatar: holandAvatar },
  { name: "Mike Hansen", avatar: mikeAvatar },
];

const phases: { name: string; date: string; state: PhaseState }[] = [
  { name: "Discovery", date: "Done 4 Sep", state: "done" },
  { name: "Analysis", date: "Due 26 Sep", state: "active" },
  { name: "Recommendations", date: "Due 10 Oct", state: "pending" },
  { name: "Handover", date: "Due 24 Oct", state: "pending" },
];

function PhaseMarker({ state }: { state: PhaseState }) {
  if (state === "done") {
    return (
      <div className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
        <Check className="size-3" strokeWidth={3} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid size-5 shrink-0 place-items-center rounded-full border-2 bg-white",
        state === "active" ? "border-brand-600" : "border-ink-200",
      )}
    >
      {state === "active" && <div className="size-2 rounded-full bg-brand-600" />}
    </div>
  );
}

export function ConsultantEngagementPreview() {
  return (
    <div aria-hidden className="rounded-3xl bg-ink-100 p-4 sm:p-6">
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_24px_60px_-36px_rgba(7,11,24,0.35)]">
        <div className="border-b border-ink-200 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-[12px] text-ink-400">Northwind Group</div>
              <div className="truncate font-display text-[17px] font-bold tracking-[-0.02em] text-ink-900">
                Operations review
              </div>
            </div>
            <StatusPill tone="brand">In progress</StatusPill>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center">
              {stakeholders.map((person, index) => (
                <Image
                  key={person.name}
                  src={person.avatar}
                  alt=""
                  sizes="28px"
                  className={cn("size-7 rounded-full object-cover ring-2 ring-white", index > 0 && "-ml-2")}
                />
              ))}
              <span className="ml-2.5 text-[11.5px] text-ink-500">3 stakeholders</span>
            </div>
            <span className="text-[11.5px] font-semibold tabular-nums text-ink-700">25%</span>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
            <ProgressFill value={25} className="bg-brand-600" />
          </div>
        </div>

        <ol className="divide-y divide-ink-100 px-5">
          {phases.map((phase) => (
            <li key={phase.name} className="flex items-center gap-3 py-3">
              <PhaseMarker state={phase.state} />
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-[12.5px] font-semibold",
                  phase.state === "pending" ? "text-ink-500" : "text-ink-900",
                )}
              >
                {phase.name}
              </span>
              <span className="shrink-0 text-[11px] text-ink-400">{phase.date}</span>
            </li>
          ))}
        </ol>

        <div className="flex items-center gap-3 border-t border-ink-200 bg-ink-50 px-5 py-3.5">
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
            <ReceiptText className="size-4" />
          </div>
          <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ink-900">Analysis phase invoice</span>
          <StatusPill tone="violet">Sent</StatusPill>
          <span className="shrink-0 text-[12.5px] font-semibold tabular-nums text-ink-700">$4,500</span>
        </div>
      </div>
    </div>
  );
}
