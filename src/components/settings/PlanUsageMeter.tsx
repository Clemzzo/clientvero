import { cn } from "@/lib/utils";

type PlanUsageMeterProps = {
  label: string;
  used: number;
  limit: number | null;
};

export function PlanUsageMeter({ label, used, limit }: PlanUsageMeterProps) {
  const percent = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const atLimit = limit !== null && used >= limit;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
        <span className="font-medium text-ink-700">{label}</span>
        <span className={cn("tabular-nums", atLimit ? "font-semibold text-coral-700" : "text-ink-500")}>
          {limit === null ? `${used} · Unlimited` : `${used} of ${limit}`}
        </span>
      </div>
      {limit !== null && (
        <div
          role="meter"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-valuenow={Math.min(used, limit)}
          className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100"
        >
          <div
            className={cn("h-full rounded-full transition-[width] duration-500", atLimit ? "bg-coral-500" : "bg-brand-600")}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}
