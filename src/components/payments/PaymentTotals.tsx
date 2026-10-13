import type { ReactNode } from "react";
import { CalendarCheck, CalendarRange, Wallet } from "lucide-react";

import { IconTile } from "@/components/shared/IconTile";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils/format";
import type { PaymentTotals as Totals } from "@/server/repositories/payment.repository";
import type { AccentTone } from "@/types/accent-tone";

type PaymentTotalsProps = {
  totals: Totals;
  currency: string;
};

type Tile = {
  label: string;
  amount: string;
  icon: ReactNode;
  tone: AccentTone;
};

export function PaymentTotals({ totals, currency }: PaymentTotalsProps) {
  const tiles: Tile[] = [
    { label: "Received this month", amount: totals.thisMonth, icon: <CalendarCheck />, tone: "mint" },
    { label: "Received this year", amount: totals.thisYear, icon: <CalendarRange />, tone: "ocean" },
    { label: "Received all time", amount: totals.allTime, icon: <Wallet />, tone: "brand" },
  ];

  return (
    <div className="space-y-2">
      <ul aria-label="Payment totals" className="grid gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <li key={tile.label}>
            <Card className="flex items-center gap-4 p-5">
              <IconTile icon={tile.icon} tone={tile.tone} size="md" />
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-ink-500">{tile.label}</p>
                <p className="mt-0.5 font-display text-[clamp(20px,1.8vw,24px)] font-bold leading-tight tracking-[-0.02em] text-ink-900 tabular-nums">
                  {formatMoney(tile.amount, currency)}
                </p>
              </div>
            </Card>
          </li>
        ))}
      </ul>
      {totals.otherCurrencyCount > 0 && (
        <p className="text-[12.5px] text-ink-500">
          {totals.otherCurrencyCount === 1
            ? `1 payment in another currency isn't included in these totals.`
            : `${totals.otherCurrencyCount} payments in other currencies aren't included in these totals.`}
        </p>
      )}
    </div>
  );
}
