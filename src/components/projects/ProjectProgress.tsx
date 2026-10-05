import { cn } from "@/lib/utils";

type ProjectProgressProps = {
  value: number;
  label: string;
  className?: string;
};

export function ProjectProgress({ value, label, className }: ProjectProgressProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className="h-2 min-w-16 flex-1 overflow-hidden rounded-full bg-ink-100"
      >
        <div className="h-full rounded-full bg-brand-600 transition-[width]" style={{ width: `${value}%` }} />
      </div>
      <span className="w-9 text-right text-[13px] font-medium tabular-nums text-ink-700">{value}%</span>
    </div>
  );
}
