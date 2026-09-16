import type { ReactNode } from "react";
import { Check, Eye, Send } from "lucide-react";

import { cn } from "@/lib/utils";

type Tone = "brand" | "emerald" | "amber" | "violet" | "ink";

const toneClasses: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  violet: "bg-violet-50 text-violet-700",
  ink: "bg-ink-100 text-ink-500",
};

function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}

function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-xl border border-ink-200 bg-white p-3 shadow-[0_18px_40px_-28px_rgba(7,11,24,0.35)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

const pipeline: { stage: string; tone: Tone; leads: { name: string; service: string; value: string }[] }[] = [
  {
    stage: "New",
    tone: "brand",
    leads: [
      { name: "Olivia Park", service: "Website", value: "$3,200" },
      { name: "Marco Silva", service: "SEO audit", value: "$900" },
    ],
  },
  {
    stage: "Qualified",
    tone: "amber",
    leads: [{ name: "Lumen Labs", service: "Brand identity", value: "$5,400" }],
  },
  {
    stage: "Proposal sent",
    tone: "violet",
    leads: [{ name: "BrightPath", service: "Campaign", value: "$4,800" }],
  },
];

export function LeadsPreview() {
  return (
    <Frame className="grid gap-2.5 sm:grid-cols-3">
      {pipeline.map((column) => (
        <div key={column.stage} className="min-w-0 rounded-lg bg-ink-50 p-2">
          <div className="flex items-center justify-between gap-2 px-0.5">
            <StatusPill tone={column.tone}>{column.stage}</StatusPill>
            <span className="text-[10px] font-semibold text-ink-400">{column.leads.length}</span>
          </div>
          <ul className="mt-2 space-y-1.5">
            {column.leads.map((lead) => (
              <li key={lead.name} className="rounded-md border border-ink-200 bg-white px-2 py-1.5">
                <span className="block truncate text-[11px] font-semibold text-ink-900">{lead.name}</span>
                <span className="mt-0.5 flex items-center justify-between gap-2 text-[10px] text-ink-400">
                  <span className="truncate">{lead.service}</span>
                  <span className="shrink-0 font-semibold text-ink-700">{lead.value}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Frame>
  );
}

const clientTabs = ["Overview", "Projects", "Invoices", "Files"];

export function ClientPreview() {
  return (
    <Frame>
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-600 text-[11px] font-bold text-white">
          AC
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-semibold text-ink-900">Acme Co.</span>
          <span className="block truncate text-[10px] text-ink-400">Client since March</span>
        </span>
        <StatusPill tone="emerald">Active</StatusPill>
      </div>

      <div className="mt-3 flex gap-3 overflow-hidden border-b border-ink-200 text-[10.5px]">
        {clientTabs.map((tab, index) => (
          <span
            key={tab}
            className={cn(
              "-mb-px shrink-0 border-b-2 pb-1.5",
              index === 0 ? "border-brand-600 font-semibold text-ink-900" : "border-transparent text-ink-400",
            )}
          >
            {tab}
          </span>
        ))}
      </div>

      <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-ink-50 px-2 py-1.5">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-violet-100 text-[9px] font-semibold text-violet-700">
          JM
        </span>
        <span className="min-w-0 flex-1 truncate text-[10.5px] text-ink-700">James Miller</span>
        <span className="shrink-0 text-[10px] text-ink-400">Primary contact</span>
      </div>
    </Frame>
  );
}

const proposalTrail = [
  { label: "Sent", icon: Send },
  { label: "Viewed", icon: Eye },
  { label: "Accepted", icon: Check },
];

export function ProposalPreview() {
  return (
    <Frame>
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="block truncate text-[12px] font-semibold text-ink-900">Campaign proposal</span>
          <span className="block truncate text-[10px] text-ink-400">BrightPath</span>
        </span>
        <span className="shrink-0 font-display text-[15px] font-bold tracking-tight text-ink-900">$4,800</span>
      </div>

      <ol className="mt-3 flex items-center">
        {proposalTrail.map((step, index) => {
          const last = index === proposalTrail.length - 1;
          return (
            <li key={step.label} className={cn("flex items-center", !last && "flex-1")}>
              <span className="flex items-center gap-1">
                <span
                  className={cn(
                    "grid size-5 place-items-center rounded-full",
                    last ? "bg-emerald-500 text-white" : "bg-ink-100 text-ink-500",
                  )}
                >
                  <step.icon className="size-2.5" strokeWidth={2.5} />
                </span>
                <span className={cn("text-[10px]", last ? "font-semibold text-emerald-700" : "text-ink-500")}>
                  {step.label}
                </span>
              </span>
              {!last && <span className="mx-1.5 h-px flex-1 bg-ink-200" />}
            </li>
          );
        })}
      </ol>
    </Frame>
  );
}

const milestones = [
  { name: "Discovery", done: true },
  { name: "Wireframes", done: true },
  { name: "Visual design", done: true },
  { name: "Launch", done: false },
];

export function ProjectPreview() {
  const completed = milestones.filter((milestone) => milestone.done).length;
  const progress = Math.round((completed / milestones.length) * 100);

  return (
    <Frame>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[12px] font-semibold text-ink-900">Website redesign</span>
        <span className="shrink-0 text-[10px] font-semibold text-ink-500">{progress}%</span>
      </div>
      <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-ink-100">
        <span className="block h-full rounded-full bg-brand-600" style={{ width: `${progress}%` }} />
      </span>

      <ul className="mt-3 space-y-1.5">
        {milestones.map((milestone) => (
          <li key={milestone.name} className="flex items-center gap-2 text-[10.5px]">
            <span
              className={cn(
                "grid size-4 shrink-0 place-items-center rounded-full",
                milestone.done ? "bg-brand-600 text-white" : "border border-ink-200 bg-white",
              )}
            >
              {milestone.done && <Check className="size-2.5" strokeWidth={3} />}
            </span>
            <span className={milestone.done ? "text-ink-400 line-through" : "font-medium text-ink-900"}>
              {milestone.name}
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

const invoiceLines = [
  { description: "Design sprint", amount: "$1,800.00" },
  { description: "Development", amount: "$700.00" },
];

export function InvoicePreview() {
  return (
    <Frame>
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0">
          <span className="block truncate text-[12px] font-semibold text-ink-900">INV-0042</span>
          <span className="block truncate text-[10px] text-ink-400">Acme Co.</span>
        </span>
        <StatusPill tone="emerald">
          <Check className="size-2.5" strokeWidth={3} />
          Paid
        </StatusPill>
      </div>

      <ul className="mt-3 space-y-1 border-b border-dashed border-ink-200 pb-2">
        {invoiceLines.map((line) => (
          <li key={line.description} className="flex justify-between gap-2 text-[10.5px] text-ink-500">
            <span className="truncate">{line.description}</span>
            <span className="shrink-0 tabular-nums">{line.amount}</span>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <span className="text-[10.5px] text-ink-500">Amount due</span>
        <span className="font-display text-[15px] font-bold tabular-nums tracking-tight text-ink-900">
          $0.00
        </span>
      </div>
    </Frame>
  );
}
