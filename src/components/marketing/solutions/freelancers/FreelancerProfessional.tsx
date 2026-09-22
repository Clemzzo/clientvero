import { Check, FolderKanban, LayoutDashboard, Link2, ReceiptText, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { StatusPill } from "@/components/marketing/feature-previews";
import { ProductSection } from "@/components/marketing/product/product-section";
import { cn } from "@/lib/utils";

type Benefit = { title: string; detail: string; icon: LucideIcon; badge?: string };

const benefits: Benefit[] = [
  {
    title: "A proposal they accept online",
    detail: "A branded link instead of a PDF, with nothing to print, sign, or scan.",
    icon: Link2,
  },
  {
    title: "A private portal",
    detail: "Progress, files, and invoices for their project, and nothing else.",
    icon: LayoutDashboard,
  },
  {
    title: "Invoices with your brand",
    detail: "Your logo, your currency, and a clear balance due.",
    icon: ReceiptText,
  },
  {
    title: "Start from an AI draft",
    detail: "Draft proposals and client updates in seconds, then edit them in your own voice.",
    icon: Sparkles,
    badge: "Pro",
  },
];

const youSkip = ["Formatting documents by hand", "Writing status-update emails", "Hunting for the latest file"];

const proposalLines = [
  { label: "Scope", value: "Logo, palette, type" },
  { label: "Deliverables", value: "Brand guidelines" },
  { label: "Timeline", value: "6 weeks" },
];

function ProposalMockup() {
  return (
    <div aria-hidden className="relative">
      <div className="rounded-3xl bg-white/5 p-3 ring-1 ring-white/10 sm:p-4">
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_30px_70px_-40px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between gap-3 border-b border-ink-200 px-5 py-4">
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-600 text-[11px] font-bold text-white">
                MR
              </span>
              <span className="truncate text-[13px] font-semibold text-ink-900">Maya Reyes Studio</span>
            </span>
            <StatusPill tone="emerald">Accepted</StatusPill>
          </div>

          <div className="px-5 pb-5 pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">Proposal</p>
            <p className="mt-1.5 font-display text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink-900">
              Brand identity
            </p>
            <p className="mt-1 text-[12px] text-ink-500">Prepared for Lumen Labs</p>

            <div className="mt-5 space-y-2.5">
              {proposalLines.map((line) => (
                <div key={line.label} className="flex items-baseline gap-2 text-[12.5px]">
                  <span className="shrink-0 text-ink-500">{line.label}</span>
                  <span className="min-w-4 flex-1 border-b border-dotted border-ink-200" />
                  <span className="truncate font-medium text-ink-700">{line.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-baseline justify-between border-t border-ink-200 pt-4">
              <span className="text-[12.5px] font-semibold text-ink-900">Total</span>
              <span className="font-display text-[22px] font-bold tabular-nums tracking-[-0.02em] text-ink-900">
                $5,400
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 px-5 py-3 text-[12.5px] font-semibold text-emerald-700">
            <span className="grid size-5 place-items-center rounded-full bg-emerald-500 text-white">
              <Check className="size-3" strokeWidth={3} />
            </span>
            Accepted online · 12 Sep
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)] lg:absolute lg:-bottom-6 lg:-right-6 lg:mt-0 lg:max-w-65">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <FolderKanban className="size-4.5" />
        </span>
        <span className="min-w-0">
          <span className="block text-[12.5px] font-semibold text-ink-900">Project created</span>
          <span className="block text-[11px] text-ink-500">5 milestones in their portal</span>
        </span>
      </div>
    </div>
  );
}

function BenefitTile({ benefit }: { benefit: Benefit }) {
  const accent = Boolean(benefit.badge);

  return (
    <li
      className={cn(
        "flex flex-col rounded-2xl border p-5 transition-colors duration-200 motion-reduce:transition-none",
        accent
          ? "border-brand-400/30 bg-brand-500/15 hover:bg-brand-500/20"
          : "border-white/10 bg-white/5 hover:bg-white/8",
      )}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-brand-500/15 text-brand-200">
          <benefit.icon aria-hidden className="size-4.5" />
        </span>
        {benefit.badge && (
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white">
            {benefit.badge}
          </span>
        )}
      </span>
      <h3 className="mt-5 font-display text-[16px] font-bold tracking-[-0.02em] text-white">{benefit.title}</h3>
      <p className="mt-1.5 text-[13.5px] leading-[1.6] text-brand-100">{benefit.detail}</p>
    </li>
  );
}

export function FreelancerProfessional() {
  return (
    <ProductSection
      id="professional"
      title="Look established, even as a team of one."
      intro="Clients judge the work by how it's delivered. Give them the polished experience of a studio without hiring anyone to run it."
      dark
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-14">
        <div className="lg:col-span-5">
          <ProposalMockup />
        </div>

        <div className="lg:col-span-7">
          <ul className="grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <BenefitTile key={benefit.title} benefit={benefit} />
            ))}
          </ul>

          <div className="mt-4 rounded-2xl border border-dashed border-white/15 p-5">
            <h3 className="text-[13px] font-semibold text-white">What you skip</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {youSkip.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-white/5 px-3 py-1.5 text-[13px] text-brand-200 line-through decoration-brand-300/50"
                >
                  <span className="sr-only">No more </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </ProductSection>
  );
}
