import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { StatusPill, type Tone } from "@/components/marketing/feature-previews";
import {
  guideHref,
  stageLabel,
  type Guide,
} from "@/components/marketing/resources/guides/guides";
import { cn } from "@/lib/utils";

export const toneTileClasses: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
  rose: "bg-rose-50 text-rose-600",
  ink: "bg-ink-100 text-ink-500",
};

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500";

export function GuideIcon({
  guide,
  className,
  iconClassName = "size-5",
}: {
  guide: Guide;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={cn(
        "grid place-items-center",
        className,
        toneTileClasses[guide.tone],
      )}
    >
      <guide.icon aria-hidden className={iconClassName} />
    </span>
  );
}

export function ReadTime({
  minutes,
  className,
}: {
  minutes: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-400",
        className,
      )}
    >
      <Clock aria-hidden className="size-3.5" />
      {minutes} min read
    </span>
  );
}

function GuideCardFooter({ guide }: { guide: Guide }) {
  return (
    <div className="mt-6 flex items-center justify-between border-t border-ink-100 pt-4">
      <ReadTime minutes={guide.readMinutes} />
      <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700">
        Read
        <ArrowRight
          aria-hidden
          className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      </span>
    </div>
  );
}

export function GuideCard({
  guide,
  className,
}: {
  guide: Guide;
  className?: string;
}) {
  return (
    <Link
      href={guideHref(guide.slug)}
      className={cn(
        "group flex h-full flex-col rounded-2xl border border-ink-200 bg-white p-6 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_24px_50px_-30px_rgba(7,11,24,0.35)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        focusRing,
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <GuideIcon guide={guide} className="size-11 rounded-xl" />
        <StatusPill tone={guide.tone}>{stageLabel(guide.stage)}</StatusPill>
      </div>

      <div className="flex-1">
        <h3 className="mt-6 font-display text-[18px] font-bold leading-[1.3] tracking-[-0.02em] text-ink-900 transition-colors duration-200 group-hover:text-brand-700">
          {guide.title}
        </h3>
        <p className="mt-2 text-[14px] leading-[1.6] text-ink-500">
          {guide.summary}
        </p>
      </div>

      <GuideCardFooter guide={guide} />
    </Link>
  );
}
