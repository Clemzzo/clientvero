import type { ReactNode } from "react";
import { ArrowRight, Check, Filter, Search, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { LeadsPreview, StatusPill } from "@/components/marketing/feature-previews";
import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

type SectionProps = {
  id: string;
  title: string;
  intro: string;
  className?: string;
  dark?: boolean;
  children: ReactNode;
};

function Section({ id, title, intro, className, dark = false, children }: SectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("py-20 lg:py-28", dark && "bg-brand-950", className)}
    >
      <div className="mx-auto max-w-360 px-5 sm:px-8 lg:px-10">
        <Reveal>
          <h2
            id={headingId}
            className={cn(
              "max-w-[22ch] font-display text-[clamp(26px,2.6vw,33px)] font-extrabold leading-[1.15] tracking-[-0.03em]",
              dark ? "text-white" : "text-ink-900",
            )}
          >
            {title}
          </h2>
          <p
            className={cn(
              "mt-3.5 max-w-[52ch] text-[14.5px] leading-[1.6]",
              dark ? "text-brand-100" : "text-ink-500",
            )}
          >
            {intro}
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-12">
          {children}
        </Reveal>
      </div>
    </section>
  );
}

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
    <Section
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
    </Section>
  );
}

const carriedOver = 
["Name and email", 
 "Phone number", 
 "Company and website"];

const conversionSteps = [
  "The lead is marked Won",
  "Its notes and activity stay attached",
  "If anything fails, nothing is half-converted",
];

function CheckList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-[14px] font-semibold text-white">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-[14px] text-brand-100">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-500 text-white">
              <Check aria-hidden className="size-3" strokeWidth={3} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

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
    <Section
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
    </Section>
  );
}

const tools: { title: string; detail: string; icon: LucideIcon }[] = [
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
    <Section
      id="find"
      title="Find any lead in seconds."
      intro="A growing list stays easy to work with."
      className="bg-ink-50"
    >
      <ul className="grid gap-5 sm:grid-cols-3">
        {tools.map((tool) => (
          <li
            key={tool.title}
            className="flex flex-col rounded-2xl border border-ink-200 bg-white p-6 sm:p-7"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <tool.icon aria-hidden className="size-5" />
            </span>
            <h3 className="mt-5 font-display text-[17px] font-bold tracking-[-0.02em] text-ink-900">
              {tool.title}
            </h3>
            <p className="mt-2 text-[14px] leading-[1.6] text-ink-500">{tool.detail}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
