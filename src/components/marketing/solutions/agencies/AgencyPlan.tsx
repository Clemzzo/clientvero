import Link from "next/link";
import { ArrowRight, Check, Sprout } from "lucide-react";

import { ProductSection } from "@/components/marketing/product/product-section";
import { Button } from "@/components/ui/button";
import { formatPlanPrice, plans, type Plan } from "@/features/subscriptions/plans";

function AgencyPlanCard({ plan }: { plan: Plan }) {
  const headingId = `agency-plan-${plan.id}-heading`;

  return (
    <article
      aria-labelledby={headingId}
      className="relative isolate overflow-hidden rounded-3xl bg-brand-950 p-7 text-white sm:p-9"
    >
      <div className="grid gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-10">
        <div className="flex flex-col">
          <h3 id={headingId} className="font-display text-[22px] font-bold tracking-[-0.02em]">
            {plan.name}
          </h3>
          <p className="mt-1.5 text-[14px] text-brand-100">{plan.audience}</p>
          <p className="mt-7 flex items-baseline gap-1.5">
            <span className="font-display text-[52px] font-extrabold leading-none tracking-[-0.04em]">
              {formatPlanPrice(plan)}
            </span>
            <span className="text-[14px] text-brand-200">/month</span>
          </p>
          <Button
            size="lg"
            className="mt-8 w-full rounded-lg bg-white text-brand-950 hover:bg-brand-50 focus-visible:outline-white sm:w-fit"
            asChild
          >
            <Link href={plan.cta.href}>{plan.cta.label}</Link>
          </Button>
        </div>

        <ul
          aria-label={`${plan.name} plan includes`}
          className="space-y-3 border-t border-white/10 pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0"
        >
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-[14.5px] leading-normal text-brand-100">
              <div className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-500 text-white">
                <Check aria-hidden className="size-3" strokeWidth={3} />
              </div>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function AgencyPlan() {
  const agencyPlan = plans.find((plan) => plan.id === "agency");

  if (!agencyPlan) {
    return null;
  }

  return (
    <ProductSection
      id="plan"
      title="One plan for the whole studio."
      intro="A single monthly price for your workspace, with room for your team to grow."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.38fr)]">
        <AgencyPlanCard plan={agencyPlan} />

        <div className="flex flex-col justify-between gap-6 rounded-3xl border border-ink-200 bg-ink-50 p-7">
          <div>
            <div className="grid size-10 place-items-center rounded-xl bg-white text-brand-600 ring-1 ring-ink-200">
              <Sprout aria-hidden className="size-4.5" />
            </div>
            <h3 className="mt-5 font-display text-[16px] font-bold tracking-[-0.02em] text-ink-900">
              Growing from solo?
            </h3>
            <p className="mt-1.5 text-[14px] leading-[1.6] text-ink-500">
              Start on Free or Pro, then upgrade when your first teammate joins. Your clients and history come with you.
            </p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex w-fit items-center gap-1.5 rounded-md text-[14px] font-semibold text-brand-600 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Compare all plans
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </ProductSection>
  );
}
