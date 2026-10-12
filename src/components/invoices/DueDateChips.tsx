import { addDays } from "@/features/invoices/invoice-dates";
import { cn } from "@/lib/utils";

const TERMS = [7, 14, 30] as const;

type DueDateChipsProps = {
  issueDate: string;
  dueDate: string;
  onPick: (dueDate: string) => void;
};

export function DueDateChips({ issueDate, dueDate, onPick }: DueDateChipsProps) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(issueDate)) return null;

  return (
    <div role="group" aria-label="Payment terms" className="flex flex-wrap gap-1.5">
      {TERMS.map((days) => {
        const value = addDays(issueDate, days);
        const selected = value === dueDate;

        return (
          <button
            key={days}
            type="button"
            aria-pressed={selected}
            onClick={() => onPick(value)}
            className={cn(
              "rounded-full border px-3 py-1 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
              selected ? "border-brand-600 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-700 hover:border-ink-400/50 hover:bg-ink-50",
            )}
          >
            {days} days
          </button>
        );
      })}
    </div>
  );
}
