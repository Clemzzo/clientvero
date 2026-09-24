import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ProductSection } from "@/components/marketing/product/product-section";
import {
  guideHref,
  guides,
  stageLabel,
  type Guide,
} from "@/components/marketing/resources/guides/guides";

function LoopConnector() {
  return (
    <div
      aria-hidden
      className="absolute left-14 right-0 top-[27px] hidden h-px bg-linear-to-r from-white/30 to-white/5 lg:block"
    />
  );
}

function LoopStep({ guide, step }: { guide: Guide; step: number }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-5 lg:border-0 lg:bg-transparent lg:p-0">
      <div className="relative z-10 grid size-14 place-items-center rounded-2xl border border-white/10 bg-brand-950 text-brand-200">
        <guide.icon aria-hidden className="size-5" />
      </div>

      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-300">
        Step {step} · {stageLabel(guide.stage)}
      </p>
      <Link
        href={guideHref(guide.slug)}
        className="mt-1.5 font-display text-[15px] font-bold leading-[1.35] tracking-[-0.01em] text-white underline-offset-4 hover:underline"
      >
        {guide.title}
      </Link>
      <Link
        href={guide.product.href}
        className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-brand-200 transition-colors duration-200 hover:text-white lg:mt-auto lg:pt-3"
      >
        {guide.product.label}
        <ArrowUpRight aria-hidden className="size-3.5" />
      </Link>
    </div>
  );
}

export function GuidesLoop() {
  return (
    <ProductSection
      id="loop"
      title="Every guide maps to one step."
      intro="Together they cover the whole loop: win the work, deliver it in the open, and get paid. Each step links to the guide and to the part of ClientVero that does it for you."
      dark
    >
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:gap-0">
        {guides.map((guide, index) => (
          <li key={guide.slug} className="relative lg:pr-4">
            {index < guides.length - 1 && <LoopConnector />}
            <LoopStep guide={guide} step={index + 1} />
          </li>
        ))}
      </ol>
    </ProductSection>
  );
}
