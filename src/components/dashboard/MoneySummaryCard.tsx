import { Card, CardHeader } from "@/components/ui/card";
import type { DashboardOverview } from "@/server/repositories/dashboard.repository";
import { formatMoney } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

type MoneySummaryCardProps = {
  money: DashboardOverview["money"];
  currency: string;
};

export function MoneySummaryCard({ money, currency }: MoneySummaryCardProps) {
  const rows = [
    { label: "Revenue this month", value: money.revenueThisMonth, tone: "text-ink-900" },
    { label: "Outstanding", value: money.outstanding, tone: "text-ink-900" },
    {
      label: money.overdueInvoices > 0 ? `Overdue · ${money.overdueInvoices} invoices` : "Overdue",
      value: money.overdue,
      tone: Number(money.overdue) > 0 ? "text-destructive" : "text-ink-900",
    },
  ];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader title="Money" description={`Invoices and payments in ${currency}`} />

      <dl className="mt-4 flex-1 divide-y divide-ink-200 px-5 sm:px-6">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 py-3.5">
            <dt className="text-[14px] text-ink-500">{row.label}</dt>
            <dd className={cn("text-[15px] font-semibold tabular-nums", row.tone)}>{formatMoney(row.value, currency)}</dd>
          </div>
        ))}
      </dl>

      <p className="mx-5 mb-5 mt-2 rounded-lg bg-ink-50 px-3 py-2.5 text-[12.5px] leading-snug text-ink-500 sm:mx-6 sm:mb-6">
        Totals fill in as you send invoices and record payments.
      </p>
    </Card>
  );
}
