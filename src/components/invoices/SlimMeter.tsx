import { paidShare } from "@/features/invoices/paid-share";

type SlimMeterProps = {
  amountPaid: string;
  total: string;
};

export function SlimMeter({ amountPaid, total }: SlimMeterProps) {
  const percent = paidShare(amountPaid, total);

  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-24 overflow-hidden rounded-full bg-ink-100" aria-hidden>
        <span className="block h-full rounded-full bg-mint-500" style={{ width: `${percent}%` }} />
      </span>
      <span className="text-[12.5px] tabular-nums text-ink-500">{Math.floor(percent)}% paid</span>
    </span>
  );
}
