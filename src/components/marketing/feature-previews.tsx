import type { ReactNode } from "react";
import { Check, CreditCard, Eye, FileText, Send, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export type Tone = "brand" | "emerald" | "amber" | "violet" | "rose" | "ink";

const toneClasses: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  violet: "bg-violet-50 text-violet-700",
  rose: "bg-rose-50 text-rose-700",
  ink: "bg-ink-100 text-ink-500",
};

export function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) {
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

const row = "rounded-xl bg-white ring-1 ring-ink-200/70";
const highlightedRow = "rounded-xl bg-emerald-50 ring-1 ring-emerald-200";

function Frame({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden className="w-full">
      {children}
    </div>
  );
}

function PreviewHeader({ title, meta }: { title: ReactNode; meta: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <span className="flex min-w-0 items-center gap-2 text-[13px] font-semibold text-ink-900">{title}</span>
      <span className="shrink-0 text-[11.5px] text-ink-400">{meta}</span>
    </div>
  );
}

function Initials({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-full bg-ink-100 text-[9.5px] font-bold text-ink-500",
        className,
      )}
    >
      {children}
    </span>
  );
}

const leads: { name: string; initials: string; service: string; value: string; stage: string; tone: Tone }[] = [
  { name: "Olivia Park", initials: "OP", service: "Website", value: "$3,200", stage: "New", tone: "brand" },
  { name: "Lumen Labs", initials: "LL", service: "Brand identity", value: "$5,400", stage: "Qualified", tone: "amber" },
  { name: "BrightPath", initials: "BP", service: "Campaign", value: "$4,800", stage: "Proposal sent", tone: "violet" },
];

export function LeadsPreview() {
  return (
    <Frame>
      <PreviewHeader title="Pipeline" meta="3 leads" />
      <ul className="space-y-2">
        {leads.map((lead) => (
          <li key={lead.name} className={cn(row, "flex items-center gap-2.5 px-3 py-2.5")}>
            <Initials>{lead.initials}</Initials>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold text-ink-900">{lead.name}</span>
              <span className="block truncate text-[10.5px] text-ink-400">
                {lead.service} · {lead.value}
              </span>
            </span>
            <StatusPill tone={lead.tone}>{lead.stage}</StatusPill>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

const clientStats = [
  { label: "Projects", value: "2" },
  { label: "Invoiced", value: "$7,300" },
  { label: "Outstanding", value: "$0" },
];

export function ClientPreview() {
  return (
    <Frame>
      <PreviewHeader
        title={
          <>
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-brand-600 text-[9px] font-bold text-white">
              AC
            </span>
            <span className="truncate">Acme Co.</span>
          </>
        }
        meta={<StatusPill tone="emerald">Active</StatusPill>}
      />

      <dl className="grid grid-cols-3 gap-2">
        {clientStats.map((stat) => (
          <div key={stat.label} className={cn(row, "min-w-0 px-2.5 py-2")}>
            <dt className="truncate text-[10px] text-ink-400">{stat.label}</dt>
            <dd className="mt-0.5 truncate font-display text-[14px] font-bold tabular-nums tracking-tight text-ink-900">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className={cn(row, "mt-2 flex items-center gap-2.5 px-3 py-2.5")}>
        <Initials className="bg-violet-100 text-violet-700">JM</Initials>
        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ink-900">James Miller</span>
        <span className="shrink-0 text-[10.5px] text-ink-400">Primary contact</span>
      </div>
    </Frame>
  );
}

const proposalTrail = [
  { label: "Sent", time: "Mon, 9:12", icon: Send },
  { label: "Viewed", time: "Tue, 14:30", icon: Eye },
  { label: "Accepted", time: "Wed, 10:05", icon: Check },
];

export function ProposalPreview() {
  return (
    <Frame>
      <PreviewHeader
        title={<span className="truncate">Campaign proposal</span>}
        meta={<span className="font-semibold tabular-nums text-ink-900">$4,800</span>}
      />
      <ol className="space-y-2">
        {proposalTrail.map((step, index) => {
          const accepted = index === proposalTrail.length - 1;
          return (
            <li
              key={step.label}
              className={cn(accepted ? highlightedRow : row, "flex items-center gap-2.5 px-3 py-2.5")}
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full",
                  accepted ? "bg-emerald-500 text-white" : "bg-ink-100 text-ink-500",
                )}
              >
                <step.icon className="size-3" strokeWidth={2.5} />
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-[12px] font-semibold",
                  accepted ? "text-emerald-700" : "text-ink-900",
                )}
              >
                {step.label}
              </span>
              <span className="shrink-0 text-[10.5px] tabular-nums text-ink-400">{step.time}</span>
            </li>
          );
        })}
      </ol>
    </Frame>
  );
}

const milestones = [
  { name: "Discovery", due: "Aug 4", done: true },
  { name: "Wireframes", due: "Aug 18", done: true },
  { name: "Visual design", due: "Sep 1", done: true },
  { name: "Launch", due: "Sep 22", done: false },
];

export function ProjectPreview() {
  const completed = milestones.filter((milestone) => milestone.done).length;
  const progress = Math.round((completed / milestones.length) * 100);

  return (
    <Frame>
      <PreviewHeader
        title={<span className="truncate">Website redesign</span>}
        meta={<span className="font-semibold tabular-nums text-ink-700">{progress}%</span>}
      />
      <span className="mb-3 block h-1.5 overflow-hidden rounded-full bg-ink-200/70">
        <span className="block h-full rounded-full bg-brand-600" style={{ width: `${progress}%` }} />
      </span>

      <ul className={cn(row, "divide-y divide-ink-200/70")}>
        {milestones.map((milestone) => (
          <li key={milestone.name} className="flex items-center gap-2.5 px-3 py-2 text-[11.5px]">
            <span
              className={cn(
                "grid size-4 shrink-0 place-items-center rounded-full",
                milestone.done ? "bg-brand-600 text-white" : "border border-ink-200 bg-white",
              )}
            >
              {milestone.done && <Check className="size-2.5" strokeWidth={3} />}
            </span>
            <span
              className={cn(
                "min-w-0 flex-1 truncate",
                milestone.done ? "text-ink-400 line-through" : "font-semibold text-ink-900",
              )}
            >
              {milestone.name}
            </span>
            <span className="shrink-0 text-[10.5px] tabular-nums text-ink-400">{milestone.due}</span>
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
      <PreviewHeader
        title={<span className="truncate">INV-0042</span>}
        meta={
          <StatusPill tone="emerald">
            <Check className="size-2.5" strokeWidth={3} />
            Paid
          </StatusPill>
        }
      />

      <div className={cn(row, "px-3 py-2.5")}>
        <ul className="space-y-1 border-b border-dashed border-ink-200 pb-2">
          {invoiceLines.map((line) => (
            <li key={line.description} className="flex justify-between gap-2 text-[11px] text-ink-500">
              <span className="truncate">{line.description}</span>
              <span className="shrink-0 tabular-nums">{line.amount}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <span className="text-[11px] text-ink-500">Amount due</span>
          <span className="font-display text-[15px] font-bold tabular-nums tracking-tight text-ink-900">
            $0.00
          </span>
        </div>
      </div>

      <div className={cn(highlightedRow, "mt-2 flex items-center gap-2 px-3 py-2.5 text-[11px] text-emerald-700")}>
        <CreditCard className="size-3.5 shrink-0" strokeWidth={2.25} />
        <span className="min-w-0 flex-1 truncate font-medium">Paid by card on Sep 12</span>
        <span className="shrink-0 font-semibold tabular-nums">$2,500.00</span>
      </div>
    </Frame>
  );
}

const sharedFiles = [
  { name: "Brand guidelines", meta: "PDF · 2.4 MB", fresh: true },
  { name: "Homepage mockups", meta: "PNG · 5.1 MB", fresh: false },
  { name: "Logo pack", meta: "ZIP · 12 MB", fresh: false },
];

export function FilesPreview() {
  return (
    <Frame>
      <PreviewHeader title="Shared files" meta="4 files" />
      <ul className="space-y-2">
        {sharedFiles.map((file) => (
          <li key={file.name} className={cn(row, "flex items-center gap-2.5 px-3 py-2.5")}>
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-500">
              <FileText className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold text-ink-900">{file.name}</span>
              <span className="block truncate text-[10.5px] text-ink-400">{file.meta}</span>
            </span>
            <span className={cn("size-2 shrink-0 rounded-full", file.fresh ? "bg-emerald-500" : "bg-ink-200")} />
          </li>
        ))}
      </ul>
    </Frame>
  );
}

export function MessagesPreview() {
  return (
    <Frame>
      <PreviewHeader title="Website redesign" meta={<StatusPill tone="violet">2 new</StatusPill>} />
      <div className="space-y-2">
        <div className="flex items-end gap-2">
          <Initials className="bg-violet-100 text-violet-700">JM</Initials>
          <p className={cn(row, "rounded-bl-md px-3 py-2 text-[11.5px] leading-normal text-ink-700")}>
            Love the new homepage. Could we try a shorter hero headline?
          </p>
        </div>
        <p className="ml-auto w-fit max-w-[85%] rounded-xl rounded-br-md bg-brand-600 px-3 py-2 text-[11.5px] leading-normal text-white">
          Done. The updated version is in Files.
        </p>
        <p className="text-right text-[10px] text-ink-400">Seen 2 min ago</p>
      </div>
    </Frame>
  );
}

export function AiAssistPreview() {
  return (
    <Frame>
      <PreviewHeader
        title={
          <>
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
              <Sparkles className="size-3.5" />
            </span>
            AI assist
          </>
        }
        meta={<span className="font-medium text-emerald-600">Draft ready</span>}
      />
      <div className="space-y-2">
        <p className={cn(row, "px-3 py-2.5 text-[11.5px] leading-normal text-ink-700")}>
          I drafted a 3-phase proposal for BrightPath: 6 weeks, totalling{" "}
          <span className="font-semibold text-emerald-600">$4,800</span>.
        </p>
        <p className="rounded-xl bg-ink-100 px-3 py-2.5 text-[11.5px] text-ink-700 ring-1 ring-ink-200">
          Add a discovery workshop to phase one.
        </p>
      </div>
    </Frame>
  );
}
