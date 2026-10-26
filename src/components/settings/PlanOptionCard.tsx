import type { ReactNode } from "react";
import { Check, Sparkles } from "lucide-react";

import { formatPlanPrice, type Plan } from "@/features/subscriptions/plans";
import { cn } from "@/lib/utils";

type PlanOptionCardProps = {
  plan: Plan;
  recommended?: boolean;
  action: ReactNode;
};

export function PlanOptionCard({ plan, recommended = false, action }: PlanOptionCardProps) {
  const headingId = `billing-plan-${plan.id}`;

  return (
    <article
      aria-labelledby={headingId}
      className={cn(
        "flex flex-col rounded-2xl border bg-white p-5 sm:p-6",
        recommended ? "border-brand-300 shadow-[0_12px_32px_-20px_rgba(46,63,191,0.45)]" : "border-ink-200",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 id={headingId} className="font-display text-[18px] font-bold tracking-[-0.02em] text-ink-900">
          {plan.name}
        </h3>
        {recommended && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[12px] font-semibold text-brand-700">
            <Sparkles aria-hidden className="size-3" />
            Popular
          </span>
        )}
      </div>
      <p className="mt-1 text-[13.5px] text-ink-500">{plan.audience}</p>
      <p className="mt-5 flex items-baseline gap-1">
        <span className="font-display text-[32px] font-extrabold leading-none tracking-[-0.03em] text-ink-900">{formatPlanPrice(plan)}</span>
        <span className="text-[13.5px] text-ink-500">/month</span>
      </p>
      <ul aria-label={`${plan.name} includes`} className="mt-5 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-[13.5px] leading-snug text-ink-700">
            <Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-brand-600" strokeWidth={3} />
            {feature}
          </li>
        ))}
      </ul>
      {action}
    </article>
  );
}
