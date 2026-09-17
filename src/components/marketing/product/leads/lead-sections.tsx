import { ArrowRight, Filter, Search, UserPlus } from "lucide-react";

import { LeadsPreview, StatusPill } from "@/components/marketing/feature-previews";
import {
  CheckList,
  FeatureCards,
  ProductSection,
  type FeatureCard,
} from "@/components/marketing/product/product-section";

const stages = [
  { name: "New", detail: "Just came in and hasn't been reviewed yet." },
  { name: "Qualified", detail: "A real fit, worth a conversation." },
  { name: "Proposal sent", detail: "Waiting on their decision." },
  { name: "Negotiation", detail: "Agreeing on scope and price." },
  { name: "Won", detail: "Converted into a client." },
  { name: "Lost", detail: "Kept for reference, out of your way." },
];

export function LeadPipeline() {
  return (
    <ProductSection
      id="pipeline"
      title="See where every deal stands."
      intro="Every lead moves through the same clear stages, so you always know what needs your attention next. Switch between pipeline and list view whenever you like."
      className="bg-ink-50"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
        <ol className="divide-y divide-ink-200 border-y border-ink-200">
          {stages.map((stage) => (
            <li key={stage.name} className="flex items-baseline gap-4 py-3.5">
              <span className="w-28 shrink-0 text-[14px] font-semibold text-ink-900">{stage.name}</span>
              <span className="text-[14px] leading-normal text-ink-500">{stage.detail}</span>
            </li>
          ))}
        </ol>
        <LeadsPreview />
      </div>
    </ProductSection>
  );
}

const carriedOver = ["Name and email", "Phone number", "Company and website"];

const conversionSteps = [
  "The lead is marked Won",
  "Its notes and activity stay attached",
  "If anything fails, nothing is half-converted",
];

function ConversionPreview() {
  return (
    <div
      aria-hidden
      className="flex flex-col items-stretch gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center"
    >
      <div className="flex-1 rounded-xl border border-ink-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-ink-400">Lead</span>
          <StatusPill tone="emerald">Won</StatusPill>
        </div>
        <p className="mt-2 font-display text-[15px] font-bold text-ink-900">Olivia Park</p>
        <p className="text-[12px] text-ink-500">Park &amp; Co.</p>
      </div>

      <span className="grid size-8 shrink-0 place-items-center self-center rounded-full bg-brand-500 text-white">
        <ArrowRight className="size-4 rotate-90 sm:rotate-0" />
      </span>

      <div className="flex-1 rounded-xl border border-ink-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-ink-400">Client</span>
          <StatusPill tone="brand">Active</StatusPill>
        </div>
        <p className="mt-2 font-display text-[15px] font-bold text-ink-900">Park &amp; Co.</p>
        <p className="text-[12px] text-ink-500">Olivia Park, primary contact</p>
      </div>
    </div>
  );
}

export function LeadConversion() {
  return (
    <ProductSection
      id="convert"
      title="From lead to client in one click."
      intro="When a lead says yes, convert it and start sending proposals straight away. No retyping details into another tool."
      dark
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="grid gap-8 sm:grid-cols-2">
          <CheckList title="What carries over" items={carriedOver} />
          <CheckList title="What happens" items={conversionSteps} />
        </div>
        <ConversionPreview />
      </div>
    </ProductSection>
  );
}

const tools: FeatureCard[] = [
  { title: "Search", detail: "Look up any lead by name, company, or email.", icon: Search },
  { title: "Filter", detail: "Narrow the list by status or where the lead came from.", icon: Filter },
  {
    title: "Assign",
    detail: "On the Agency plan, give a lead to a teammate so nothing slips.",
    icon: UserPlus,
  },
];

export function LeadSearch() {
  return (
    <ProductSection
      id="find"
      title="Find any lead in seconds."
      intro="A growing list stays easy to work with."
      className="bg-ink-50"
    >
      <FeatureCards items={tools} />
    </ProductSection>
  );
}
