import type { ReactNode } from "react";
import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

type ProductSectionProps = {
  id: string;
  title: string;
  intro: string;
  className?: string;
  dark?: boolean;
  children: ReactNode;
};

export function ProductSection({
  id,
  title,
  intro,
  className,
  dark = false,
  children,
}: ProductSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("py-20 lg:py-28", dark && "bg-brand-950", className)}
    >
      <div className="mx-auto max-w-360 px-5 sm:px-8 lg:px-10">
        <Reveal>
          <h2
            id={headingId}
            className={cn(
              "max-w-[22ch] font-display text-[clamp(26px,2.6vw,33px)] font-extrabold leading-[1.15] tracking-[-0.03em]",
              dark ? "text-white" : "text-ink-900",
            )}
          >
            {title}
          </h2>
          <p
            className={cn(
              "mt-3.5 max-w-[52ch] text-[14.5px] leading-[1.6]",
              dark ? "text-brand-100" : "text-ink-500",
            )}
          >
            {intro}
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-12">
          {children}
        </Reveal>
      </div>
    </section>
  );
}

export function CheckList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-[14px] font-semibold text-white">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-[14px] text-brand-100">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-500 text-white">
              <Check aria-hidden className="size-3" strokeWidth={3} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export type FeatureCard = { title: string; detail: string; icon: LucideIcon };

export function FeatureCards({ items, className }: { items: FeatureCard[]; className?: string }) {
  return (
    <ul className={cn("grid gap-5 sm:grid-cols-3", className)}>
      {items.map((item) => (
        <li
          key={item.title}
          className="flex flex-col rounded-2xl border border-ink-200 bg-white p-6 sm:p-7"
        >
          <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <item.icon aria-hidden className="size-5" />
          </span>
          <h3 className="mt-5 font-display text-[17px] font-bold tracking-[-0.02em] text-ink-900">
            {item.title}
          </h3>
          <p className="mt-2 text-[14px] leading-[1.6] text-ink-500">{item.detail}</p>
        </li>
      ))}
    </ul>
  );
}
