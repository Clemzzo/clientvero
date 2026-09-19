import { Calculator, CalendarClock, Eye, LayoutList, Sparkles, Users } from "lucide-react";

import { StatusPill, type Tone } from "@/components/marketing/feature-previews";
import {
  CheckList,
  FeatureCards,
  HandoffPreview,
  ProductSection,
  type FeatureCard,
} from "@/components/marketing/product/product-section";
import { cn } from "@/lib/utils";

const builderTools: FeatureCard[] = [
  {
    title: "Sections",
    detail: "Introduction, scope, deliverables, timeline, and terms, plus any of your own.",
    icon: LayoutList,
  },
  {
    title: "Pricing",
    detail: "Add a discount and tax, and the total is worked out for you in your currency.",
    icon: Calculator,
  },
  {
    title: "Linked to the client",
    detail: "Every proposal is filed on the client's record, next to their projects and invoices.",
    icon: Users,
  },
  { title: "Preview", detail: "See exactly what your client will see before you send it.", icon: Eye },
  {
    title: "Expiry date",
    detail: "Set when the offer ends, so an old price can't be accepted months later.",
    icon: CalendarClock,
  },
  {
    title: "AI draft",
    detail: "On Pro and Agency, turn a short brief into a first draft you can edit.",
    icon: Sparkles,
  },
];

export function ProposalBuilder() {
  return (
    <ProductSection
      id="builder"
      title="A clear proposal in minutes."
      intro="Pick the client, fill in the sections that fit the job, and set your price. No blank document, no copying last time's file."
      className="bg-ink-50"
    >
      <FeatureCards items={builderTools} />
    </ProductSection>
  );
}

type Status = { name: string; detail: string; tone: Tone };

const toneDots: Record<Tone, string> = {
  brand: "bg-brand-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500",
  ink: "bg-ink-400",
};

const journey: Status[] = [
  { name: "Draft", detail: "Still being written. Only your team can see it.", tone: "ink" },
  { name: "Sent", detail: "Emailed to your client as a private link.", tone: "brand" },
  { name: "Viewed", detail: "Your client has opened it.", tone: "violet" },
];

const outcomes: Status[] = [
  { name: "Accepted", detail: "Agreed, and ready to become a project.", tone: "emerald" },
  { name: "Declined", detail: "Your client passed on it this time.", tone: "amber" },
  { name: "Expired", detail: "The offer ended before they decided.", tone: "ink" },
  { name: "Withdrawn", detail: "You took it back before they decided.", tone: "ink" },
];

function StatusJourney() {
  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-[14px] font-semibold text-ink-900">While it&apos;s out</h3>
        <ol className="mt-5">
          {journey.map((status, index) => (
            <li key={status.name} className="relative flex gap-4 pb-6 last:pb-0">
              {index < journey.length - 1 && (
                <span aria-hidden className="absolute -bottom-1.5 left-[4.5px] top-4 w-px bg-ink-200" />
              )}
              <span
                aria-hidden
                className={cn("relative mt-1.5 size-2.5 shrink-0 rounded-full ring-4 ring-white", toneDots[status.tone])}
              />
              <div>
                <p className="text-[14px] font-semibold text-ink-900">{status.name}</p>
                <p className="mt-0.5 text-[14px] leading-normal text-ink-500">{status.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h3 className="text-[14px] font-semibold text-ink-900">How it ends</h3>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {outcomes.map((status) => (
            <li key={status.name} className="rounded-xl border border-ink-200 p-4">
              <p className="flex items-center gap-2.5 text-[14px] font-semibold text-ink-900">
                <span aria-hidden className={cn("size-2 shrink-0 rounded-full", toneDots[status.tone])} />
                {status.name}
              </p>
              <p className="mt-1.5 text-[13.5px] leading-normal text-ink-500">{status.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const recentProposals: {
  title: string;
  client: string;
  initials: string;
  total: string;
  status: string;
  tone: Tone;
  when: string;
}[] = [
  {
    title: "Brand identity",
    client: "Lumen Labs",
    initials: "LL",
    total: "$5,400",
    status: "Viewed",
    tone: "violet",
    when: "2 min ago",
  },
  {
    title: "Website redesign",
    client: "Park & Co.",
    initials: "PC",
    total: "$3,300",
    status: "Accepted",
    tone: "emerald",
    when: "Today",
  },
  {
    title: "Spring campaign",
    client: "BrightPath",
    initials: "BP",
    total: "$4,800",
    status: "Sent",
    tone: "brand",
    when: "Yesterday",
  },
  {
    title: "SEO audit",
    client: "Marco Silva",
    initials: "MS",
    total: "$900",
    status: "Draft",
    tone: "ink",
    when: "Mon",
  },
];

function ProposalListPreview() {
  return (
    <div aria-hidden className="rounded-3xl bg-ink-50 p-4 sm:p-8">
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_24px_60px_-36px_rgba(7,11,24,0.35)]">
        <div className="flex items-center justify-between gap-4 border-b border-ink-200 px-4 py-3.5 sm:px-5">
          <p className="text-[13px] font-semibold text-ink-900">Proposals</p>
          <p className="flex items-baseline gap-2">
            <span className="text-[11px] text-ink-400">Awaiting a decision</span>
            <span className="font-display text-[14px] font-bold tabular-nums text-ink-900">$10,200</span>
          </p>
        </div>

        <ul className="divide-y divide-ink-200">
          {recentProposals.map((proposal) => (
            <li
              key={proposal.title}
              className="grid grid-cols-[minmax(0,1fr)_56px_76px] items-center gap-3 px-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_72px_84px] sm:px-5"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="hidden size-8 shrink-0 place-items-center rounded-full bg-ink-100 text-[10.5px] font-bold text-ink-500 sm:grid">
                  {proposal.initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] font-semibold text-ink-900">{proposal.title}</span>
                  <span className="block truncate text-[11px] text-ink-400">{proposal.client}</span>
                </span>
              </span>
              <span className="text-right font-display text-[13px] font-bold tabular-nums text-ink-900">
                {proposal.total}
              </span>
              <span className="flex flex-col items-end gap-1">
                <StatusPill tone={proposal.tone}>{proposal.status}</StatusPill>
                <span className="text-[10.5px] text-ink-400">{proposal.when}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3 shadow-[0_18px_40px_-28px_rgba(7,11,24,0.35)] sm:ml-auto sm:w-fit">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-violet-50 text-violet-700">
          <Eye className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[12.5px] font-semibold text-ink-900">
            Lumen Labs opened Brand identity
          </span>
          <span className="block text-[11px] text-ink-400">2 minutes ago</span>
        </span>
      </div>
    </div>
  );
}

export function ProposalTracking() {
  return (
    <ProductSection
      id="tracking"
      title="Know where every proposal stands."
      intro="Each proposal shows its status as it moves, so you know when it's been opened and when to follow up, without asking."
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16">
        <StatusJourney />
        <ProposalListPreview />
      </div>
    </ProductSection>
  );
}

const clientView = [
  "Your business name and logo",
  "Scope, pricing, timeline, and terms",
  "A clear accept or decline button",
];

const afterAcceptance = [
  "It's marked Accepted, with the date",
  "You're notified straight away",
  "Turn it into a project in one step",
];

export function ProposalAcceptance() {
  return (
    <ProductSection
      id="accept"
      title="Your client accepts online."
      intro="Send a private link. Your client reads the proposal in their browser and accepts it there, without creating an account."
      dark
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="grid gap-8 sm:grid-cols-2">
          <CheckList title="What your client sees" items={clientView} />
          <CheckList title="What happens next" items={afterAcceptance} />
        </div>
        <HandoffPreview
          from={{
            label: "Proposal",
            status: "Accepted",
            tone: "emerald",
            title: "Website redesign",
            detail: "Park & Co. · $3,300 USD",
          }}
          to={{ label: "Project", status: "Planning", tone: "brand", title: "Website redesign", detail: "Park & Co." }}
        />
      </div>
    </ProductSection>
  );
}
