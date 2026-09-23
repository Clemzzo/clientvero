import { FileText, Flag, MessageSquareText, NotebookPen, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ProductSection } from "@/components/marketing/product/product-section";

const rawNotes = [
  "james ok w/ 2 site pilot first",
  "holand: budget sign-off needs Q4 numbers",
  "supplier data late again → chase",
  "next call after interviews done",
];

const summary = {
  decisions: ["Pilot at two sites before full rollout", "Q4 figures required for budget sign-off"],
  nextSteps: ["Request supplier data by Friday", "Book review call after interviews"],
};

const tools: { title: string; detail: string; icon: LucideIcon }[] = [
  { title: "Proposal drafts", detail: "Start from a structured first draft.", icon: FileText },
  { title: "Milestone suggestions", detail: "Break an engagement into phases.", icon: Flag },
  { title: "Client updates", detail: "Turn progress into a clear update.", icon: MessageSquareText },
  { title: "Meeting summaries", detail: "Decisions and next steps from notes.", icon: NotebookPen },
];

function SummaryMockup() {
  return (
    <div aria-hidden className="relative rounded-3xl bg-ink-100 p-4 sm:p-6">
      <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-4 sm:mr-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">Your notes</p>
        <ul className="mt-2.5 space-y-1.5">
          {rawNotes.map((note) => (
            <li key={note} className="text-[12.5px] italic text-ink-400">
              {note}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 -my-3 flex justify-center sm:mr-12">
        <div className="grid size-9 place-items-center rounded-full bg-brand-600 text-white shadow-[0_8px_20px_-8px_rgba(59,69,245,0.7)]">
          <Sparkles className="size-4" />
        </div>
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-[0_24px_60px_-36px_rgba(7,11,24,0.35)] sm:ml-12">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-[15px] font-bold text-ink-900">Meeting summary</p>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
            AI draft
          </span>
        </div>
        <p className="mt-3 text-[11px] font-semibold text-ink-500">Decisions</p>
        <ul className="mt-1 space-y-1">
          {summary.decisions.map((item) => (
            <li key={item} className="flex gap-2 text-[12.5px] text-ink-700">
              <div className="mt-1.75 size-1 shrink-0 rounded-full bg-brand-500" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] font-semibold text-ink-500">Next steps</p>
        <ul className="mt-1 space-y-1">
          {summary.nextSteps.map((item) => (
            <li key={item} className="flex gap-2 text-[12.5px] text-ink-700">
              <div className="mt-1.75 size-1 shrink-0 rounded-full bg-emerald-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ConsultantAiAssist() {
  return (
    <ProductSection
      id="ai"
      title="Less time writing about the work."
      intro="On Pro, AI gives you a first draft of the writing that surrounds every engagement. You review, edit, and decide what gets sent."
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <SummaryMockup />

        <div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {tools.map((tool) => (
              <li key={tool.title} className="rounded-2xl border border-ink-200 bg-white p-5">
                <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <tool.icon aria-hidden className="size-4.5" />
                </div>
                <h3 className="mt-4 font-display text-[16px] font-bold tracking-[-0.02em] text-ink-900">
                  {tool.title}
                </h3>
                <p className="mt-1 text-[13.5px] leading-[1.6] text-ink-500">{tool.detail}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-ink-200 p-4 text-[13.5px] leading-normal text-ink-500">
            <Sparkles aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-600" />
            <p>
              <span className="font-semibold text-ink-900">An assistant, not an autopilot.</span> Nothing reaches
              your client until you&apos;ve read it and pressed send.
            </p>
          </div>
        </div>
      </div>
    </ProductSection>
  );
}
