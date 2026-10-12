import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type BannerAction = {
  label: string;
  href: string;
};

type GetStartedBannerProps = {
  title: string;
  description: string;
  primaryAction: BannerAction;
  secondaryAction?: BannerAction;
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600";

export function GetStartedBanner({ title, description, primaryAction, secondaryAction }: GetStartedBannerProps) {
  return (
    <section
      aria-labelledby="get-started-title"
      className="relative overflow-hidden rounded-2xl bg-linear-to-r from-brand-700 via-brand-600 to-grape-500 p-6 shadow-[0_12px_32px_-16px_rgba(7,11,24,0.35)] sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-grape-500/50 blur-3xl"
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 max-w-xl">
          <h2
            id="get-started-title"
            className="font-display text-[clamp(18px,1.6vw,22px)] font-bold leading-snug tracking-[-0.02em] text-white"
          >
            {title}
          </h2>
          <p className="mt-1.5 text-[14.5px] font-medium leading-normal text-white/85">{description}</p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3">
          <Button
            asChild
            className={`group rounded-full bg-white text-ink-900 hover:bg-white/90 ${focusRing}`}
          >
            <Link href={primaryAction.href}>
              {primaryAction.label}
              <ChevronRight
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </Link>
          </Button>

          {secondaryAction && (
            <Button
              asChild
              className={`rounded-full border border-white/30 bg-white/15 text-white hover:bg-white/25 ${focusRing}`}
            >
              <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
