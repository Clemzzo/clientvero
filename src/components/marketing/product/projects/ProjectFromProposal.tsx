import { ArrowDown, Check, ChevronRight } from "lucide-react";

import { StatusPill } from "@/components/marketing/FeaturePreviews";
import { ProductSection } from "@/components/marketing/product/ProductSection";

const carriedFields = [
  { from: "Client", to: "Client", value: "BrightPath Studio" },
  { from: "Title", to: "Project name", value: "Website redesign" },
  { from: "Total", to: "Budget", value: "$6,500.00 USD" },
  { from: "Status", to: "Linked proposal", value: "Accepted", target: "Website redesign" },
];

const openFields = ["Start date", "Due date"];

function ProposalDocument() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_32px_80px_-40px_rgba(0,0,0,0.6)]">
      <div className="flex h-16 items-center justify-between gap-3 border-b border-ink-200 px-5">
        <h3 className="font-display text-[15px] font-bold text-ink-900">Proposal</h3>
        <StatusPill tone="emerald">Accepted</StatusPill>
      </div>

      <dl className="divide-y divide-ink-200">
        {carriedFields.map((field) => (
          <div key={field.from} className="flex h-14 items-center justify-between gap-4 px-5">
            <dt className="text-[12.5px] text-ink-400">{field.from}</dt>
            <dd className="truncate text-[13px] font-semibold tabular-nums text-ink-900">{field.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex h-28 items-center gap-3.5 border-t border-ink-200 bg-ink-50 px-5">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
          <Check aria-hidden className="size-4" strokeWidth={3} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[16px] font-bold text-ink-900">Dana Reed</p>
          <p className="mt-1 border-t border-ink-200 pt-1.5 text-[11.5px] text-ink-500">
            Accepted for BrightPath Studio on 12 Sep
          </p>
        </div>
      </div>
    </div>
  );
}

function ProjectRecord() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/6">
      <div className="flex h-16 items-center justify-between gap-3 border-b border-white/10 px-5">
        <h3 className="font-display text-[15px] font-bold text-white">New project</h3>
        <StatusPill tone="violet">Planning</StatusPill>
      </div>

      <dl className="divide-y divide-white/10">
        {carriedFields.map((field) => (
          <div key={field.to} className="flex h-14 items-center justify-between gap-4 px-5">
            <dt className="text-[12.5px] text-brand-200">{field.to}</dt>
            <dd className="flex min-w-0 items-center gap-2 text-[13px] font-semibold tabular-nums text-white">
              <div aria-hidden className="size-1.5 shrink-0 rounded-full bg-emerald-400" />
              <div className="truncate">{field.target ?? field.value}</div>
            </dd>
          </div>
        ))}
        {openFields.map((field) => (
          <div key={field} className="flex h-14 items-center justify-between gap-4 px-5">
            <dt className="text-[12.5px] text-brand-200">{field}</dt>
            <dd className="rounded-md border border-dashed border-white/30 px-2.5 py-1 text-[12px] text-brand-100">
              Add a date
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function FieldConnectors() {
  return (
    <div aria-hidden className="hidden pt-16 lg:block">
      {carriedFields.map((field) => (
        <div key={field.from} className="flex h-14 items-center">
          <div className="size-1.5 shrink-0 rounded-full bg-emerald-400" />
          <div className="h-px flex-1 bg-brand-400/70" />
          <ChevronRight className="-ml-1.5 size-4 shrink-0 text-brand-300" />
        </div>
      ))}
    </div>
  );
}

export function ProjectFromProposal() {
  return (
    <ProductSection
      id="from-proposal"
      title="An accepted proposal becomes a project."
      intro="When your client accepts, create the project from the proposal in one step. What you agreed on is already filled in, and you add the dates."
      dark
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)] lg:gap-0">
          <ProposalDocument />
          <FieldConnectors />
          <div aria-hidden className="grid place-items-center lg:hidden">
            <div className="grid size-9 place-items-center rounded-full bg-brand-500 text-white">
              <ArrowDown className="size-4" />
            </div>
          </div>
          <ProjectRecord />
        </div>

        <div className="mt-8 flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap gap-x-6 gap-y-3 text-[13px] text-brand-100">
            <li className="flex items-center gap-2">
              <div aria-hidden className="size-2 rounded-full bg-emerald-400" />
              Filled in from the proposal
            </li>
            <li className="flex items-center gap-2">
              <div aria-hidden className="size-3 rounded-[3px] border border-dashed border-white/40" />
              You add when you&apos;re ready
            </li>
          </ul>
          <p className="text-[13px] text-brand-200">No proposal? You can also start a project from scratch.</p>
        </div>
      </div>
    </ProductSection>
  );
}
