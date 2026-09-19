import { Filter, Search, UserPlus } from "lucide-react";

import { LeadsPreview } from "@/components/marketing/feature-previews";
import {
  CheckList,
  FeatureCards,
  HandoffPreview,
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
        <HandoffPreview
          from={{ label: "Lead", status: "Won", tone: "emerald", title: "Olivia Park", detail: "Park & Co." }}
          to={{
            label: "Client",
            status: "Active",
            tone: "brand",
            title: "Park & Co.",
            detail: "Olivia Park, primary contact",
          }}
        />
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
