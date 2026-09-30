import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type ProductHeroProps = {
  eyebrow: string;
  title: string;
  intro: string;
  preview: ReactNode;
};

export function ProductHero({ eyebrow, title, intro, preview }: ProductHeroProps) {
  return (
    <section aria-labelledby="product-hero-heading" className="pb-20 pt-10 lg:pb-28 lg:pt-16">
      <div className="mx-auto grid max-w-360 gap-14 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:px-10">
        <div className="rise-in">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-600">{eyebrow}</p>
          <h1
            id="product-hero-heading"
            className="mt-4 max-w-[16ch] font-display text-[clamp(38px,4.8vw,58px)] font-extrabold leading-[1.04] tracking-[-0.035em] text-ink-900"
          >
            {title}
          </h1>
          <p className="mt-6 max-w-[52ch] text-[16px] leading-[1.65] text-ink-500">{intro}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" className="rounded-lg" asChild>
              <Link href="/sign-up">Start for free</Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-lg" asChild>
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>

        <div className="rise-in [animation-delay:120ms]">{preview}</div>
      </div>
    </section> 
  );
}
