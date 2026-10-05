import type { ReactNode } from "react";
import { Clock, TrendingUp, TriangleAlert, Wallet } from "lucide-react";

import { IconTile } from "@/components/shared/IconTile";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/utils/format";
import type { DashboardOverview } from "@/server/repositories/dashboard.repository";
import type { AccentTone } from "@/types/accent-tone";

type MoneySummaryCardProps = {
  money: DashboardOverview["money"];
  currency: string;
};

type MoneyRow = {
  label: string;
  value: string;
  icon: ReactNode;
  tone: AccentTone;
  highlight?: boolean;
};

export function MoneySummaryCard({ money, currency }: MoneySummaryCardProps) {
  const rows: MoneyRow[] = [
    { label: "Revenue this month", value: money.revenueThisMonth, icon: <TrendingUp />, tone: "mint" },
    { label: "Outstanding", value: money.outstanding, icon: <Clock />, tone: "sun" },
    {
      label: money.overdueInvoices > 0 ? `Overdue · ${money.overdueInvoices} invoices` : "Overdue",
      value: money.overdue,
      icon: <TriangleAlert />,
      tone: "coral",
      highlight: Number(money.overdue) > 0,
    },
  ];

  return (
    <Card>
      <CardHeader title="Money" description={`Invoices and payments in ${currency}`} icon={{ node: <Wallet />, tone: "mint" }} />

      <dl className="mt-3 divide-y divide-ink-200 px-5 sm:px-6">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3 py-3.5">
            <IconTile icon={row.icon} tone={row.tone} />
            <dt className="flex-1 text-[14px] text-ink-500">{row.label}</dt>
            <dd className={cn("text-[15px] font-semibold tabular-nums", row.highlight ? "text-coral-700" : "text-ink-900")}>
              {formatMoney(row.value, currency)}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mx-5 mb-5 mt-1 rounded-lg bg-ink-50 px-3 py-2.5 text-[12.5px] leading-snug text-ink-500 sm:mx-6 sm:mb-6">
        Totals fill in as you send invoices and record payments.
      </p>
    </Card>
  );
}
