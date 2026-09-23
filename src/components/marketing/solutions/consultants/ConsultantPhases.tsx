import { Check, ChartNoAxesColumn, FileText, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ProductSection } from "@/components/marketing/product/product-section";
import { cn } from "@/lib/utils";

type PhaseState = "done" | "active" | "pending";

const phases: { name: string; detail: string; state: PhaseState }[] = [
  { name: "Discovery", detail: "Interviews and data gathered", state: "done" },
  { name: "Analysis", detail: "Findings in progress", state: "active" },
  { name: "Recommendations", detail: "Report and roadmap", state: "pending" },
  { name: "Handover", detail: "Final session and files", state: "pending" },
];

const stateLabels: Record<PhaseState, string> = {
  done: "Completed",
  active: "In progress",
  pending: "Up next",
};

const tiles: { title: string; detail: string; icon: LucideIcon }[] = [
  {
    title: "Reports and decks in the portal",
    detail: "Share each deliverable once. Your client always finds the latest version.",
    icon: FileText,
  },
  {
    title: "One conversation per engagement",
    detail: "Questions and decisions sit next to the work, not in a forwarded email chain.",
    icon: MessageSquare,
  },
  {
    title: "Progress that updates itself",
    detail: "Complete a phase and the engagement's progress moves forward for everyone.",
    icon: ChartNoAxesColumn,
  },
];

function PhaseNode({ state }: { state: PhaseState }) {
  return (
    <div
      className={cn(
        "relative z-10 grid size-9 shrink-0 place-items-center rounded-full",
        state === "done" && "bg-emerald-500 text-white",
        state === "active" && "bg-brand-500 text-white shadow-[0_0_0_6px_rgba(91,92,246,0.25)]",
        state === "pending" && "border border-white/15 bg-brand-950 text-brand-200",
      )}
    >
      {state === "done" ? (
        <Check aria-hidden className="size-4" strokeWidth={3} />
      ) : (
        <div className={cn("size-2 rounded-full", state === "active" ? "bg-white" : "bg-white/25")} />
      )}
    </div>
  );
}

function PhaseTrack() {
  return (
    <ol className="grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 lg:grid-cols-4 lg:gap-0">
      {phases.map((phase, index) => (
        <li key={phase.name} className="relative flex gap-4 lg:flex-col lg:gap-5 lg:pr-6">
          {index < phases.length - 1 && (
            <div
              aria-hidden
              className={cn(
                "absolute left-4.25 top-9 -bottom-6 w-0.5 lg:left-9 lg:right-0 lg:top-4.25 lg:bottom-auto lg:h-0.5 lg:w-auto",
                phase.state === "done" ? "bg-emerald-400/60" : "bg-white/10",
              )}
            />
          )}
          <PhaseNode state={phase.state} />
          <div className="min-w-0 pt-1 lg:pt-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-300">
              {stateLabels[phase.state]}
            </div>
            <div className="mt-1 font-display text-[16px] font-bold tracking-[-0.02em] text-white">{phase.name}</div>
            <div className="mt-0.5 text-[13px] text-brand-100">{phase.detail}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ConsultantPhases() {
  return (
    <ProductSection
      id="phases"
      title="Deliver in phases your client can follow."
      intro="Turn the engagement into clear milestones. Your client sees what's done, what's in progress, and what comes next, without asking for a status call."
      dark
    >
      <PhaseTrack />

      <ul className="mt-4 grid gap-4 md:grid-cols-3">
        {tiles.map((tile) => (
          <li
            key={tile.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors duration-200 hover:bg-white/8 motion-reduce:transition-none"
          >
            <div className="grid size-10 place-items-center rounded-xl bg-brand-500/15 text-brand-200">
              <tile.icon aria-hidden className="size-4.5" />
            </div>
            <h3 className="mt-5 font-display text-[16px] font-bold tracking-[-0.02em] text-white">{tile.title}</h3>
            <p className="mt-1.5 text-[13.5px] leading-[1.6] text-brand-100">{tile.detail}</p>
          </li>
        ))}
      </ul>
    </ProductSection>
  );
}
