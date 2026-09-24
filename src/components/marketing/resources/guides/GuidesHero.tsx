import Link from "next/link";

import type { Tone } from "@/components/marketing/feature-previews";
import {
  focusRing,
  GuideIcon,
  ReadTime,
} from "@/components/marketing/resources/guides/GuideCard";
import {
  getFeaturedGuide,
  guideHref,
  guides,
  stageLabel,
  type Guide,
} from "@/components/marketing/resources/guides/guides";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const backSheetClasses: Record<Tone, string> = {
  brand: "bg-brand-200",
  emerald: "bg-emerald-100",
  amber: "bg-amber-100",
  violet: "bg-violet-100",
  rose: "bg-rose-100",
  ink: "bg-ink-200",
};

const sheetInset =
  "absolute inset-x-3 inset-y-4 rounded-[20px] sm:inset-x-6 sm:inset-y-6";

function HeroIntro() {
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-[13px] font-medium text-ink-400">
          <li>Resources</li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-ink-900">
            Guides
          </li>
        </ol>
      </nav>

      <h1
        id="guides-hero-heading"
        className="mt-6 max-w-[12ch] font-display text-[clamp(40px,5.2vw,64px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-ink-900"
      >
        Playbooks for client work.
      </h1>
      <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.65] text-ink-500">
        Short, practical guides for each step of running a client business, from
        the first enquiry to the final payment. Each one takes about as long to
        read as a coffee takes to cool.
      </p>
    </>
  );
}

function StepLink({ guide, step }: { guide: Guide; step: number }) {
  return (
    <Link
      href={guideHref(guide.slug)}
      title={guide.title}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-3.5 py-3 text-[14px] font-medium text-ink-700 transition-colors duration-200 hover:border-ink-900 hover:text-ink-900",
        focusRing,
      )}
    >
      <span className="grid size-6 shrink-0 place-items-center rounded-md bg-ink-100 text-[12px] font-semibold tabular-nums text-ink-500">
        {step}
      </span>
      {stageLabel(guide.stage)}
    </Link>
  );
}

function StepIndex() {
  return (
    <nav aria-labelledby="guide-steps-heading" className="mt-12">
      <h2
        id="guide-steps-heading"
        className="text-[14px] font-semibold text-ink-900"
      >
        Start at any step
      </h2>
      <ol className="mt-4 grid max-w-lg grid-cols-2 gap-2 sm:grid-cols-3">
        {guides.map((guide, index) => (
          <li key={guide.slug}>
            <StepLink guide={guide} step={index + 1} />
          </li>
        ))}
      </ol>
    </nav>
  );
}

function BackSheets({ tone }: { tone: Tone }) {
  return (
    <>
      <div
        aria-hidden
        className={cn("sheet-fan bg-brand-100 [--fan:-4deg]", sheetInset)}
      />
      <div
        aria-hidden
        className={cn(
          "sheet-fan [--fan:2.5deg]",
          sheetInset,
          backSheetClasses[tone],
        )}
      />
    </>
  );
}

function GuideMeta({ guide }: { guide: Guide }) {
  return (
    <div className="flex items-center gap-4">
      <GuideIcon guide={guide} className="size-11 shrink-0 rounded-xl" />
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-ink-900">
          Featured playbook
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[13px] text-ink-500">
          <span>{stageLabel(guide.stage)}</span>
          <ReadTime minutes={guide.readMinutes} />
        </p>
      </div>
    </div>
  );
}

function SectionList({ guide }: { guide: Guide }) {
  return (
    <div className="mt-7 border-t border-ink-200 pt-6">
      <p className="text-[13px] font-semibold text-ink-900">In this guide</p>
      <ol className="mt-3">
        {guide.sections.map((section, index) => (
          <li key={section.id}>
            <Link
              href={`${guideHref(guide.slug)}#${section.id}`}
              className={cn(
                "-mx-2 flex items-baseline gap-3.5 rounded-lg px-2 py-2 text-[14.5px] text-ink-700 transition-colors duration-200 hover:bg-ink-50 hover:text-ink-900",
                focusRing,
              )}
            >
              <span className="w-4 shrink-0 text-right text-[13px] font-semibold tabular-nums text-ink-400">
                {index + 1}
              </span>
              {section.heading}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

function FeaturedGuideSheet() {
  const guide = getFeaturedGuide();
  const href = guideHref(guide.slug);

  return (
    <div className="relative px-3 py-4 sm:px-6 sm:py-6">
      <BackSheets tone={guide.tone} />

      <article className="relative rounded-[20px] border border-ink-200 bg-white p-6 shadow-[0_30px_60px_-36px_rgba(7,11,24,0.4)] sm:p-9">
        <GuideMeta guide={guide} />

        <h2 className="mt-7 font-display text-[clamp(24px,2.4vw,30px)] font-extrabold leading-[1.15] tracking-[-0.03em] text-ink-900">
          <Link
            href={href}
            className={cn(
              "rounded-sm transition-colors duration-200 hover:text-brand-700",
              focusRing,
            )}
          >
            {guide.title}
          </Link>
        </h2>
        <p className="mt-3 max-w-[52ch] text-[15px] leading-[1.6] text-ink-500">
          {guide.summary}
        </p>

        <SectionList guide={guide} />

        <Button className="mt-7 w-full rounded-lg sm:w-auto" asChild>
          <Link href={href}>Read the guide</Link>
        </Button>
      </article>
    </div>
  );
}

export function GuidesHero() {
  return (
    <section
      aria-labelledby="guides-hero-heading"
      className="pb-20 pt-10 lg:pb-28 lg:pt-14"
    >
      <div className="mx-auto grid max-w-360 gap-12 px-4 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16 lg:px-10">
        <div className="rise-in">
          <HeroIntro />
          <StepIndex />
        </div>

        <div className="rise-in [animation-delay:120ms]">
          <FeaturedGuideSheet />
        </div>
      </div>
    </section>
  );
}
