import { cn } from "@/lib/utils";

type InvoiceNumberProps = {
  value: string;
  className?: string;
};

export function InvoiceNumber({ value, className }: InvoiceNumberProps) {
  const [, prefix = "", digits = value] = /^([A-Z]+-)?(.*)$/.exec(value) ?? [];

  return (
    <span className={cn("font-display font-semibold tabular-nums tracking-[-0.01em]", className)}>
      <span className="text-ink-500">{prefix}</span>
      <span className="text-ink-900">{digits}</span>
    </span>
  );
}
