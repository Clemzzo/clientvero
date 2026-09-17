import type { ReactNode } from "react";
import { ChevronRight, MessageSquare, Paperclip, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  ClientPreview,
  InvoicePreview,
  LeadsPreview,
  ProjectPreview,
  ProposalPreview,
} from "@/components/marketing/feature-previews";
import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

type Feature = {
  id: string;
  title: string;
  detail: string;
  preview: ReactNode;
  className: string;
};

const features: Feature[] = [
  {
    id: "leads",
    title: "Capture every enquiry",
    detail:
      "Log leads from email, referrals, or your site, track where each one stands, and turn the good ones into clients in one step.",
    preview: <LeadsPreview />,
    className: "md:col-span-2 lg:col-span-4",
  },
  {
    id: "clients",
    title: "One record per client",
    detail: "Contacts, projects, proposals, invoices, and files for each client on one page.",
    preview: <ClientPreview />,
    className: "lg:col-span-2",
  },
  {
    id: "proposals",
    title: "Proposals clients accept online",
    detail: "Send a link, see when it's opened, and get notified when it's accepted.",
    preview: <ProposalPreview />,
    className: "lg:col-span-2",
  },
  {
    id: "projects",
    title: "Milestones that show progress",
    detail: "Progress updates as milestones are completed, so clients always know where things stand.",
    preview: <ProjectPreview />,
    className: "lg:col-span-2",
  },
  {
    id: "invoices",
    title: "Invoices that get paid",
    detail: "Numbered invoices, payment tracking, and an outstanding balance that stays current.",
    preview: <InvoicePreview />,
    className: "lg:col-span-2",
  },
];

const loop = ["Lead", "Client", "Proposal", "Project", "Paid"];

const extras: { title: string; detail: string; icon: LucideIcon }[] = [
  { title: "Files", detail: "Share deliverables securely with each client.", icon: Paperclip },
  { title: "Messages", detail: "Talk to clients next to the work itself.", icon: MessageSquare },
  { title: "AI assist", detail: "Draft proposals and client updates faster.", icon: Sparkles },
];

function FeatureTile({ feature, step }: { feature: Feature; step: number }) {
  return (
    <article
      id={feature.id}
      aria-labelledby={`${feature.id}-heading`}
      className={cn(
        "flex flex-col gap-6 rounded-2xl border border-ink-200 bg-ink-50 p-5 sm:p-6",
        feature.className,
      )}
    >
      <div>
        <span className="grid size-7 place-items-center rounded-full bg-white text-[12px] font-bold text-brand-600 ring-1 ring-ink-200">
          {step}
        </span>
        <h3
          id={`${feature.id}-heading`}
          className="mt-4 font-display text-[18px] font-bold leading-snug tracking-[-0.02em] text-ink-900"
        >
          {feature.title}
        </h3>
        <p className="mt-1.5 max-w-[46ch] text-[14px] leading-[1.6] text-ink-500">{feature.detail}</p>
      </div>

      <div className="mt-auto">{feature.preview}</div>
    </article>
  );
}

export function Features() {
  return (
    <section id="features" aria-labelledby="features-heading" className="py-20 lg:py-28">
      <div className="mx-auto max-w-360 px-5 sm:px-8 lg:px-10">
        <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-600">Features</p>
            <h2
              id="features-heading"
              className="mt-3.5 max-w-[20ch] font-display text-[clamp(26px,2.6vw,33px)] font-extrabold leading-[1.15] tracking-[-0.03em] text-ink-900"
            >
              Every step of client work, connected.
            </h2>
            <p className="mt-3.5 max-w-[52ch] text-[14.5px] leading-[1.6] text-ink-500">
              Each stage picks up where the last one left off, so a new enquiry becomes a paid
              project without copying details between tools.
            </p>
          </div>

          <ol
            aria-label="The ClientVero workflow"
            className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-[13px] font-semibold text-ink-700"
          >
            {loop.map((stage, index) => (
              <li key={stage} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "rounded-full border px-3 py-1",
                    index === loop.length - 1
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-ink-200 bg-white",
                  )}
                >
                  {stage}
                </span>
                {index < loop.length - 1 && (
                  <ChevronRight aria-hidden className="size-3.5 text-ink-400" />
                )}
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            {features.map((feature, index) => (
              <FeatureTile key={feature.id} feature={feature} step={index + 1} />
            ))}
          </div>

          <ul className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-ink-200 bg-ink-200 sm:grid-cols-3">
            {extras.map((extra) => (
              <li key={extra.title} className="flex items-start gap-3 bg-white p-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <extra.icon aria-hidden className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink-900">{extra.title}</p>
                  <p className="mt-0.5 text-[13px] leading-normal text-ink-500">{extra.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
