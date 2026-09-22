import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { ProductSection } from "@/components/marketing/product/product-section";
import { Button } from "@/components/ui/button";
import { formatPlanPrice, plans, type Plan, type PlanId } from "@/features/subscriptions/plans";
import { cn } from "@/lib/utils";

const FREELANCER_PLANS: PlanId[] = ["free", "pro"];
const FEATURED_PLAN: PlanId = "pro";
const FEATURES_SHOWN = 4;

function FreelancerPlanCard({ plan }: { plan: Plan }) {
  const featured = plan.id === FEATURED_PLAN;
  const headingId = `freelancer-plan-${plan.id}-heading`;

  return (
    <article
      aria-labelledby={headingId}
      className={cn(
        "flex flex-col rounded-2xl border p-6 sm:p-7",
        featured ? "border-brand-950 bg-brand-950 text-white" : "border-ink-200 bg-white text-ink-900",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 id={headingId} className="font-display text-[19px] font-bold tracking-[-0.02em]">
            {plan.name}
          </h3>
          <p className={cn("mt-1 text-[13.5px] leading-normal", featured ? "text-brand-100" : "text-ink-500")}>
            {plan.audience}
          </p>
        </div>
        <p className="flex shrink-0 items-baseline gap-1">
          <span className="font-display text-[36px] font-extrabold leading-none tracking-[-0.04em]">
            {formatPlanPrice(plan)}
          </span>
          <span className={cn("text-[13px]", featured ? "text-brand-200" : "text-ink-500")}>/mo</span>
        </p>
      </div>

      <ul
        aria-label={`${plan.name} plan includes`}
        className={cn("mt-6 flex-1 space-y-2.5 border-t pt-6", featured ? "border-white/10" : "border-ink-200")}
      >
        {plan.features.slice(0, FEATURES_SHOWN).map((feature) => (
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
    </article>
  );
}

export function FreelancerPricing() {
  const freelancerPlans = plans.filter((plan) => FREELANCER_PLANS.includes(plan.id));

  return (
    <ProductSection
      id="pricing"
      title="Priced for a business of one."
      intro="Start free with your first clients. Move to Pro when you're ready for unlimited clients and the full portal."
      className="bg-ink-50"
    >
      <div className="grid gap-5 lg:max-w-4xl lg:grid-cols-2">
        {freelancerPlans.map((plan) => (
          <FreelancerPlanCard key={plan.id} plan={plan} />
        ))}
      </div>
      <Link
        href="/pricing"
        className="mt-8 inline-flex items-center gap-1.5 rounded-md text-[14px] font-semibold text-brand-600 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        Compare all plans
        <ArrowRight aria-hidden className="size-4" />
      </Link>
    </ProductSection>
  );
}
