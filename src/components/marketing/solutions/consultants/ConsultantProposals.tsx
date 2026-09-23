import { ChevronDown, ChevronRight } from "lucide-react";

import { StatusPill, type Tone } from "@/components/marketing/feature-previews";
import { CheckItems, ProductSection } from "@/components/marketing/product/product-section";

const sections = ["Introduction", "Scope", "Deliverables", "Timeline", "Pricing", "Terms"];
const EXPANDED_SECTION = "Scope";

const scopeLines = [
  "Map current fulfilment workflow across 3 sites",
  "Interview 8 team leads and 2 suppliers",
  "Benchmark costs against 4 comparable operators",
];

const journey: { status: string; date: string; tone: Tone }[] = [
  { status: "Sent", date: "2 Sep", tone: "violet" },
  { status: "Viewed", date: "3 Sep", tone: "amber" },
  { status: "Accepted", date: "5 Sep", tone: "emerald" },
];

const proposalPoints = [
  "Structured sections you can reuse for every engagement",
  "A clear price, currency, and expiry date",
  "Know the moment your client opens it",
  "Accepted online from a private link",
];

function ProposalSpine() {
  return (
    <div aria-hidden className="rounded-3xl bg-ink-100 p-4 sm:p-6">
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_24px_60px_-36px_rgba(7,11,24,0.35)]">
        <div className="border-b border-ink-200 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">Proposal</p>
          <p className="mt-1 font-display text-[18px] font-bold tracking-[-0.02em] text-ink-900">
            Operations review
          </p>
          <p className="text-[12px] text-ink-500">Prepared for Northwind Group</p>
        </div>

        <ol className="px-3 py-3">
          {sections.map((section, index) => {
            const expanded = section === EXPANDED_SECTION;

            return (
              <li key={section} className={expanded ? "rounded-xl bg-brand-50/60 ring-1 ring-brand-100" : undefined}>
                <div className="flex items-center gap-3 px-2.5 py-2.5">
                  <span className="w-5 text-[11px] font-semibold tabular-nums text-ink-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1 text-[13px] font-semibold text-ink-900">{section}</span>
                  {expanded ? (
                    <ChevronDown className="size-4 text-brand-600" />
                  ) : (
                    <ChevronRight className="size-4 text-ink-400" />
                  )}
                </div>
                {expanded && (
                  <ul className="space-y-1.5 px-2.5 pb-3 pl-10.5">
                    {scopeLines.map((line) => (
                      <li key={line} className="flex gap-2 text-[12px] leading-normal text-ink-500">
                        <div className="mt-1.75 size-1 shrink-0 rounded-full bg-brand-400" />
                        {line}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>

        <div className="flex items-end justify-between gap-3 border-t border-ink-200 bg-ink-50 px-5 py-4">
          <div>
            <div className="text-[11px] text-ink-400">Total</div>
            <div className="font-display text-[20px] font-bold tabular-nums tracking-[-0.02em] text-ink-900">
              $13,500
            </div>
          </div>
          <span className="text-[11px] text-ink-500">Valid until 30 Sep</span>
        </div>
      </div>
    </div>
  );
}

function StatusJourney() {
  return (
    <ol aria-label="Proposal status" className="flex flex-wrap items-center gap-2">
      {journey.map((step, index) => (
        <li key={step.status} className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-ink-200 bg-white py-1 pl-1 pr-3">
            <StatusPill tone={step.tone}>{step.status}</StatusPill>
            <span className="text-[12px] text-ink-500">{step.date}</span>
          </div>
          {index < journey.length - 1 && <div aria-hidden className="h-px w-4 bg-ink-200" />}
        </li>
      ))}
    </ol>
  );
}

export function ConsultantProposals() {
  return (
    <ProductSection
      id="proposals"
      title="Proposals that sell your expertise."
      intro="Lay out the problem, the approach, and the price in a proposal that reads like it came from a firm, then watch it move from sent to accepted."
      className="bg-ink-50"
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <ProposalSpine />

        <div>
          <h3 className="text-[14px] font-semibold text-ink-900">Always know where it stands</h3>
          <div className="mt-4">
            <StatusJourney />
          </div>

          <CheckItems items={proposalPoints} className="mt-8 border-t border-ink-200 pt-8" />
        </div>
      </div>
    </ProductSection>
  );
}
