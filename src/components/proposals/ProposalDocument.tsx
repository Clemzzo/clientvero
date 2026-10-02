import type { ReactNode } from "react";

import type { Proposal, ProposalSection } from "@/db/schema";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/utils/format";
import { isZeroAmount } from "@/lib/utils/money";

export type ProposalDocumentData = Pick<
  Proposal,
  "title" | "description" | "currency" | "subtotal" | "discount" | "tax" | "total" | "timeline" | "terms" | "sentAt" | "createdAt"
> & {
  organizationName: string;
  clientName: string;
  sections: Pick<ProposalSection, "id" | "title" | "content">[];
};

type ProposalDocumentProps = {
  proposal: ProposalDocumentData;
  banner?: ReactNode;
  className?: string;
};

type DocumentBlock = {
  key: string;
  title: string;
  body: ReactNode;
};

const dateFormat = new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" });

function documentBlocks(proposal: ProposalDocumentData): DocumentBlock[] {
  const sections = proposal.sections.map((section) => ({
    key: section.id,
    title: section.title,
    body: <Prose text={section.content} />,
  }));

  const pricing = { key: "investment", title: "Investment", body: <PricingCard proposal={proposal} /> };

  const closing: DocumentBlock[] = [];
  if (proposal.timeline) closing.push({ key: "timeline", title: "Timeline", body: <Prose text={proposal.timeline} /> });
  if (proposal.terms) closing.push({ key: "terms", title: "Terms", body: <Prose text={proposal.terms} /> });

  return [...sections, pricing, ...closing];
}

function DocumentSection({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 break-inside-avoid">
      <h2 className="flex items-center gap-3 font-display text-[19px] font-bold tracking-[-0.02em] text-ink-900">
        <span
          aria-hidden
          className="grid h-7 min-w-9 place-items-center rounded-lg bg-mint-100 px-2 text-[12px] font-bold tabular-nums text-mint-700"
        >
          {String(number).padStart(2, "0")}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Prose({ text }: { text: string | null }) {
  if (!text) {
    return <p className="text-[15px] italic text-ink-500">Nothing added yet.</p>;
  }

  return <p className="max-w-[65ch] whitespace-pre-wrap text-[15px] leading-[1.7] text-ink-700">{text}</p>;
}

function PricingCard({ proposal }: { proposal: ProposalDocumentData }) {
  const { currency } = proposal;
  const rows = [{ label: "Amount", value: proposal.subtotal }];
  if (!isZeroAmount(proposal.discount)) rows.push({ label: "Discount", value: `-${proposal.discount}` });
  if (!isZeroAmount(proposal.tax)) rows.push({ label: "Tax", value: proposal.tax });

  return (
    <div className="overflow-hidden rounded-2xl border border-mint-200 bg-mint-50">
      <dl className="divide-y divide-mint-200/70 px-5 sm:px-6">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 py-3 text-[15px]">
            <dt className="text-ink-700">{row.label}</dt>
            <dd className="font-medium tabular-nums text-ink-900">{formatMoney(row.value, currency)}</dd>
          </div>
        ))}
      </dl>
      <div className="flex items-end justify-between gap-4 bg-mint-100/60 px-5 py-4 sm:px-6">
        <p className="text-[13px] font-semibold uppercase tracking-widest text-mint-800">Total</p>
        <p className="font-display text-[clamp(24px,3vw,30px)] font-bold leading-none tracking-[-0.02em] tabular-nums text-mint-800">
          {formatMoney(proposal.total, currency)}
        </p>
      </div>
    </div>
  );
}

function MetaItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-ink-500">{label}</dt>
      <dd className="mt-1 font-semibold tabular-nums text-ink-900">{children}</dd>
    </div>
  );
}

function DocumentHeader({ proposal }: { proposal: ProposalDocumentData }) {
  const initial = proposal.organizationName.trim().charAt(0).toUpperCase();

  return (
    <header className="border-b border-ink-200 bg-ink-50/60 px-6 pb-8 pt-6 sm:px-12 sm:pb-10 sm:pt-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-600 font-display text-[15px] font-bold text-white"
          >
            {initial}
          </span>
          <p className="truncate text-[15px] font-semibold text-ink-900">{proposal.organizationName}</p>
        </div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-500">Proposal</p>
      </div>

      <h1 className="mt-10 max-w-[22ch] font-display text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink-900">
        {proposal.title}
      </h1>
      {proposal.description && (
        <p className="mt-3 max-w-[60ch] text-[16px] leading-relaxed text-ink-500">{proposal.description}</p>
      )}

      <dl className="mt-8 grid gap-5 text-[14px] sm:grid-cols-3">
        <MetaItem label="Prepared for">{proposal.clientName}</MetaItem>
        <MetaItem label="Date">{dateFormat.format(proposal.sentAt ?? proposal.createdAt)}</MetaItem>
        <MetaItem label="Total">{formatMoney(proposal.total, proposal.currency)}</MetaItem>
      </dl>
    </header>
  );
}

export function ProposalDocument({ proposal, banner, className }: ProposalDocumentProps) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_24px_60px_-36px_rgba(7,11,24,0.35)] print:rounded-none print:border-0 print:shadow-none",
        className,
      )}
    >
      <DocumentHeader proposal={proposal} />

      {banner && <div className="border-b border-ink-200 px-6 py-4 sm:px-12">{banner}</div>}

      <div className="space-y-12 px-6 py-10 sm:px-12 sm:py-12">
        {documentBlocks(proposal).map((block, index) => (
          <DocumentSection key={block.key} number={index + 1} title={block.title}>
            {block.body}
          </DocumentSection>
        ))}
      </div>
    </article>
  );
}
