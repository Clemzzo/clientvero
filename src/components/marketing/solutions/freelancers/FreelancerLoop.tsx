import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { navigation, type NavLink } from "@/components/layout/navigation";
import { ProductSection } from "@/components/marketing/product/product-section";

const loopSteps: NavLink[] = navigation.find((item) => item.label === "Product")?.items ?? [];

export function FreelancerLoop() {
  return (
    <ProductSection
      id="workflow"
      title="One loop, from first enquiry to final payment."
      intro="Each step hands its details to the next, so you never copy a client's name, scope, or price from one tool into another."
    >
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loopSteps.map((step, index) => (
          <li key={step.href}>
            <Link
              href={step.href}
              className="group flex h-full flex-col rounded-2xl border border-ink-200 bg-white p-6 transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_18px_40px_-28px_rgba(7,11,24,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <span className="flex items-center justify-between">
                <span
                  aria-hidden
                  className="font-display text-[28px] font-medium leading-none tracking-[-0.04em] text-brand-200 transition-colors group-hover:text-brand-400"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <ArrowUpRight
                  aria-hidden
                  className="size-4.5 text-ink-400 transition-colors group-hover:text-brand-600"
                />
              </span>
              <span className="mt-6 font-display text-[17px] font-bold tracking-[-0.02em] text-ink-900">
                <span className="sr-only">Step {index + 1}: </span>
                {step.label}
              </span>
              {step.description && (
                <span className="mt-1.5 text-[14px] leading-[1.6] text-ink-500">{step.description}</span>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </ProductSection>
  );
}
