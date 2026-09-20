import { StatusPill, type Tone } from "@/components/marketing/feature-previews";
import { ProductSection } from "@/components/marketing/product/product-section";
import { cn } from "@/lib/utils";

const toneDots: Record<Tone, string> = {
  brand: "bg-brand-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
  ink: "bg-ink-400",
};

type Stage = { name: string; detail: string; tone: Tone };

const openStages: Stage[] = [
  { name: "New", detail: "Just came in and hasn't been reviewed yet.", tone: "brand" },
  { name: "Qualified", detail: "A real fit, worth a conversation.", tone: "amber" },
  { name: "Proposal sent", detail: "Waiting on their decision.", tone: "violet" },
  { name: "Negotiation", detail: "Agreeing on scope and price.", tone: "rose" },
];

const closedStages: Stage[] = [
  { name: "Won", detail: "Converted into a client.", tone: "emerald" },
  { name: "Lost", detail: "Kept for reference, out of your way.", tone: "ink" },
];

function StageJourney() {
  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-[14px] font-semibold text-ink-900">While it&apos;s in play</h3>
        <ol className="mt-5">
          {openStages.map((stage, index) => (
            <li key={stage.name} className="relative flex gap-4 pb-6 last:pb-0">
              {index < openStages.length - 1 && (
                <span aria-hidden className="absolute -bottom-1.5 left-[4.5px] top-4 w-px bg-ink-200" />
              )}
              <span
                aria-hidden
                className={cn("relative mt-1.5 size-2.5 shrink-0 rounded-full ring-4 ring-ink-50", toneDots[stage.tone])}
              />
              <div>
                <p className="text-[14px] font-semibold text-ink-900">{stage.name}</p>
                <p className="mt-0.5 text-[14px] leading-normal text-ink-500">{stage.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h3 className="text-[14px] font-semibold text-ink-900">How it ends</h3>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {closedStages.map((stage) => (
            <li key={stage.name} className="rounded-xl border border-ink-200 bg-white p-4">
              <p className="flex items-center gap-2.5 text-[14px] font-semibold text-ink-900">
                <span aria-hidden className={cn("size-2 shrink-0 rounded-full", toneDots[stage.tone])} />
                {stage.name}
              </p>
              <p className="mt-1.5 text-[13.5px] leading-normal text-ink-500">{stage.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const board: { stage: string; tone: Tone; total: string; leads: { name: string; initials: string; service: string; value: string }[] }[] = [
  {
    stage: "New",
    tone: "brand",
    total: "$4,100",
    leads: [
      { name: "Olivia Park", initials: "OP", service: "Website", value: "$3,200" },
      { name: "Marco Silva", initials: "MS", service: "SEO audit", value: "$900" },
    ],
  },
  {
    stage: "Qualified",
    tone: "amber",
    total: "$5,400",
    leads: [{ name: "Lumen Labs", initials: "LL", service: "Brand identity", value: "$5,400" }],
  },
  {
    stage: "Proposal sent",
    tone: "violet",
    total: "$4,800",
    leads: [{ name: "BrightPath", initials: "BP", service: "Campaign", value: "$4,800" }],
  },
  {
    stage: "Negotiation",
    tone: "rose",
    total: "$3,300",
    leads: [{ name: "Park & Co.", initials: "PC", service: "Website redesign", value: "$3,300" }],
  },
];

function PipelineBoardPreview() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-[0_30px_70px_-40px_rgba(7,11,24,0.4)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 px-4 py-3.5 sm:px-5">
        <span className="flex items-center gap-3">
          <span className="text-[13px] font-semibold text-ink-900">Leads</span>
          <span className="flex items-center gap-0.5 rounded-lg bg-ink-100 p-0.5">
            <span className="rounded-md bg-white px-2 py-0.5 text-[10.5px] font-semibold text-ink-900 shadow-sm">
              Pipeline
            </span>
            <span className="px-2 py-0.5 text-[10.5px] font-medium text-ink-500">List</span>
          </span>
        </span>
        <span className="flex items-baseline gap-2">
          <span className="text-[11px] text-ink-400">Open pipeline</span>
          <span className="font-display text-[14px] font-bold tabular-nums text-ink-900">$17,600</span>
        </span>
      </div>

      <div className="grid gap-3 bg-ink-50 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
        {board.map((column) => (
          <div key={column.stage} className="flex min-w-0 flex-col rounded-xl border border-ink-200 bg-white p-2.5">
            <div className="flex items-center justify-between gap-2 px-0.5">
              <StatusPill tone={column.tone}>{column.stage}</StatusPill>
              <span className="text-[10px] font-semibold tabular-nums text-ink-400">{column.leads.length}</span>
            </div>

            <ul className="mt-2.5 space-y-2 pb-2.5">
              {column.leads.map((lead) => (
                <li key={lead.name} className="rounded-lg border border-ink-200 bg-white px-2.5 py-2 shadow-sm">
                  <span className="flex items-center gap-2">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink-100 text-[9px] font-bold text-ink-500">
                      {lead.initials}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-ink-900">
                      {lead.name}
                    </span>
                  </span>
                  <span className="mt-1.5 flex items-center justify-between gap-2 text-[10.5px]">
                    <span className="truncate text-ink-400">{lead.service}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-ink-700">{lead.value}</span>
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-auto border-t border-ink-100 pt-2 text-[10px] tabular-nums text-ink-400">
              {column.total} in this stage
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeadPipeline() {
  return (
    <ProductSection
      id="pipeline"
      title="See where every deal stands."
      intro="Every lead moves through the same clear stages, so you always know what needs your attention next. Switch between pipeline and list view whenever you like."
      className="bg-ink-50"
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-16">
        <StageJourney />
        <PipelineBoardPreview />
      </div>
    </ProductSection>
  );
}
