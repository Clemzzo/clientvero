import type { ReactNode } from "react";
import { ArrowRight, Check, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { StatusPill, type Tone } from "@/components/marketing/feature-previews";
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
              "mt-3.5 max-w-[52ch] text-[16px] leading-[1.6]",
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

export function CheckList({
  title,
  items,
  icon: Icon = Check,
  iconClassName = "bg-brand-500 text-white",
}: {
  title: string;
  items: string[];
  icon?: LucideIcon;
  iconClassName?: string;
}) {
  return (
    <div>
      <h3 className="text-[14px] font-semibold text-white">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-[14px] text-brand-100">
            <span className={cn("grid size-5 shrink-0 place-items-center rounded-full", iconClassName)}>
              <Icon aria-hidden className="size-3" strokeWidth={3} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CheckItems({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("space-y-3.5", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2.5 text-[14px] text-ink-700">
          <div className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
            <Check aria-hidden className="size-3" strokeWidth={3} />
          </div>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function DocumentLinkBar({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-ink-200 bg-ink-50 px-4 py-2.5">
      <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-[11px] text-ink-400 ring-1 ring-ink-200">
        <Lock className="size-3 shrink-0 text-emerald-600" />
        <span className="truncate">{url}</span>
      </span>
    </div>
  );
}

type HandoffCard ={ label: string; status: string; tone: Tone; title: string; detail: string };

function HandoffCardView({ card }: { card: HandoffCard }) {
  return (
    <div className="flex-1 rounded-xl border border-ink-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-ink-400">{card.label}</span>
        <StatusPill tone={card.tone}>{card.status}</StatusPill>
      </div>
      <p className="mt-2 font-display text-[15px] font-bold text-ink-900">{card.title}</p>
      <p className="text-[12px] text-ink-500">{card.detail}</p>
    </div>
  );
}

export function HandoffPreview({ from, to }: { from: HandoffCard; to: HandoffCard }) {
  return (
    <div
      aria-hidden
      className="flex flex-col items-stretch gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center"
    >
      <HandoffCardView card={from} />
      <span className="grid size-8 shrink-0 place-items-center self-center rounded-full bg-brand-500 text-white">
        <ArrowRight className="size-4 rotate-90 sm:rotate-0" />
      </span>
      <HandoffCardView card={to} />
    </div>
  );
}

export type FeatureCard ={ title: string; detail: string; icon: LucideIcon };

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
