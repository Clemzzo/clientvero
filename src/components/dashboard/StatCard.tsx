import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
};

export function StatCard({ icon, label, value, hint }: StatCardProps) {
  return (
    <Card className="h-full p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-ink-500">{label}</p>
        <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-600 [&_svg]:size-4">
          {icon}
        </span>
      </div>
      <p className="mt-3 font-display text-[30px] font-bold leading-none tracking-[-0.03em] text-ink-900 tabular-nums">
        {value}
      </p>
      <p className="mt-2 text-[12.5px] leading-snug text-ink-500">{hint}</p>
    </Card>
  );
}
