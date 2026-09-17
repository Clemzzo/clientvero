import Link from "next/link";
import { Check } from "lucide-react";

import { Faq } from "@/components/marketing/faq";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { formatPlanPrice, plans } from "@/features/subscriptions/plans";
import type { Plan } from "@/features/subscriptions/plans";
import { cn } from "@/lib/utils";

const RECOMMENDED_PLAN = "pro";

function PlanCard({ plan }: { plan: Plan }) {
  const featured = plan.id === RECOMMENDED_PLAN;
  const headingId = `plan-${plan.id}-heading`;

  return (
    <article
      aria-labelledby={headingId}
      className={cn(
        "flex flex-col rounded-2xl border p-6 sm:p-7",
        featured
          ? "border-brand-950 bg-brand-950 text-white"
          : "border-ink-200 bg-white text-ink-900",
      )}
    >
      <h2 id={headingId} className="font-display text-[20px] font-bold tracking-[-0.02em]">
        {plan.name}
      </h2>
      <p className={cn("mt-1.5 text-[14px] leading-normal", featured ? "text-brand-100" : "text-ink-500")}>
        {plan.audience}
      </p>

      <p className="mt-7 flex items-baseline gap-1.5">
        <span className="font-display text-[44px] font-extrabold leading-none tracking-[-0.04em]">
          {formatPlanPrice(plan)}
        </span>
        <span className={cn("text-[14px]", featured ? "text-brand-200" : "text-ink-500")}>/month</span>
      </p>

      <Button
        variant={featured ? "default" : "outline"}
        size="lg"
        className={cn(
          "mt-7 w-full rounded-lg",
          featured && "bg-white text-brand-950 hover:bg-brand-50 focus-visible:outline-white",
        )}
        asChild
      >
        <Link href={plan.cta.href}>{plan.cta.label}</Link>
      </Button>

      <ul
        aria-label={`${plan.name} plan includes`}
        className={cn("mt-7 space-y-3 border-t pt-7", featured ? "border-white/10" : "border-ink-200")}
      >
        {plan.features.map((feature) => (
          <li
            key={feature}
            className={cn("flex items-start gap-2.5 text-[14px] leading-normal", featured ? "text-brand-100" : "text-ink-700")}
          >
            <span
              className={cn(
                "mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full",
                featured ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-600",
              )}
            >
              <Check aria-hidden className="size-3" strokeWidth={3} />
            </span>
            {feature}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function Pricing() {
  return (
    <>
      <section aria-labelledby="pricing-heading" className="pb-20 pt-10 lg:pb-28 lg:pt-16">
        <div className="mx-auto max-w-360 px-5 sm:px-8 lg:px-10">
          <div className="rise-in mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-600">Pricing</p>
            <h1
              id="pricing-heading"
              className="mt-4 font-display text-[clamp(35px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink-900"
            >
              Simple pricing that grows with you.
            </h1>
            <p className="mx-auto mt-5 max-w-[46ch] text-[16px] leading-[1.6] text-ink-500">
              Start free with your first clients. Upgrade when you need more room or a team.
            </p>
          </div>

          <Reveal delay={0.1} className="mt-12 lg:mt-14">
            <div className="grid gap-5 lg:grid-cols-3 lg:items-stretch">
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
            <p className="mt-6 text-center text-[13px] text-ink-500">
              Prices in USD, billed monthly. Change or cancel your plan anytime.
            </p>
          </Reveal>
        </div>
      </section>

      <Faq showPricingLink={false} />
    </>
  );
}
