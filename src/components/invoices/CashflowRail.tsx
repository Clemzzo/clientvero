import Link from "next/link";
import { AlertTriangle, BadgeCheck, Clock } from "lucide-react";
import type { ReactNode } from "react";

import { IconTile } from "@/components/shared/IconTile";
import { formatMoney } from "@/lib/utils/format";
import { fromCents, toCents } from "@/lib/utils/money";
import type { InvoiceMoneySummary } from "@/server/repositories/invoice.repository";
import type { AccentTone } from "@/types/accent-tone";

type CashflowRailProps = {
  summary: InvoiceMoneySummary;
  currency: string;
};

type Segment = {
  key: string;
  cents: bigint;
  label: ReactNode;
  href: string;
  bar: string;
  tone: AccentTone;
  icon: ReactNode;
};

function share(part: bigint, whole: bigint) {
  return whole === 0n ? 0 : Number((part * 10_000n) / whole) / 100;
}

export function CashflowRail({ summary, currency }: CashflowRailProps) {
  const settled = toCents(summary.settledThisMonth);
  const late = toCents(summary.overdue);
  const owed = toCents(summary.outstanding) - late;
  const whole = settled + owed + late;

  if (whole === 0n) return null;

  const segments: Segment[] = [
    {
      key: "settled",
      cents: settled,
      label: "settled this month",
      href: "/dashboard/invoices?status=paid",
      bar: "bg-mint-500",
      tone: "mint",
      icon: <BadgeCheck />,
    },
    {
      key: "owed",
      cents: owed,
      label: "owed, not yet due",
      href: "/dashboard/invoices?status=outstanding",
      bar: "bg-sun-500",
      tone: "sun",
      icon: <Clock />,
    },
    {
      key: "late",
      cents: late,
      label: `late on ${summary.overdueInvoices} ${summary.overdueInvoices === 1 ? "invoice" : "invoices"}`,
      href: "/dashboard/invoices?status=overdue",
      bar: "bg-coral-500",
      tone: "coral",
      icon: <AlertTriangle />,
    },
  ];

  return (
    <section aria-label="Cashflow" className="rounded-2xl border border-ink-200 bg-white p-5 sm:p-6">
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-ink-100" aria-hidden>
        {segments.map(
          (segment) =>
            segment.cents > 0n && (
              <span key={segment.key} className={`${segment.bar} h-full first:rounded-l-full last:rounded-r-full`} style={{ width: `${share(segment.cents, whole)}%` }} />
            ),
        )}
      </div>

      <ul className="mt-5 grid gap-4 sm:grid-cols-3">
        {segments.map((segment) => (
          <li key={segment.key}>
            <Link
              href={segment.href}
              className="group flex items-center gap-3 rounded-xl p-1 -m-1 outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              <IconTile icon={segment.icon} tone={segment.tone} />
              <span className="min-w-0">
                <span className="block font-display text-[22px] font-bold leading-tight tracking-[-0.02em] tabular-nums text-ink-900">
                  {formatMoney(fromCents(segment.cents), currency)}
                </span>
                <span className="block text-[13px] text-ink-500 group-hover:text-ink-700">{segment.label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {summary.openInOtherCurrencies > 0 && (
        <p className="mt-4 text-[12.5px] text-ink-500">
          Totals are in {currency}. {summary.openInOtherCurrencies} open{" "}
          {summary.openInOtherCurrencies === 1 ? "invoice is" : "invoices are"} in other currencies.
        </p>
      )}
    </section>
  );
}
