import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { StatusPill } from "@/components/marketing/feature-previews";
import {
  GuideIcon,
  ReadTime,
} from "@/components/marketing/resources/guides/GuideCard";
import {
  guideStep,
  stageLabel,
  type Guide,
} from "@/components/marketing/resources/guides/guides";

function Breadcrumb({ guide }: { guide: Guide }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-[13px] font-medium text-ink-400">
        <li>
          <Link
            href="/guides"
            className="transition-colors duration-200 hover:text-brand-700"
          >
            Guides
          </Link>
        </li>
        <li aria-hidden>
          <ChevronRight className="size-3.5" />
        </li>
        <li aria-current="page" className="text-ink-700">
          {stageLabel(guide.stage)}
        </li>
      </ol>
    </nav>
  );
}

function GuideTitleBlock({ guide }: { guide: Guide }) {
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-3">
        <StatusPill tone={guide.tone}>
          Step {guideStep(guide.slug)} · {stageLabel(guide.stage)}
        </StatusPill>
        <ReadTime minutes={guide.readMinutes} />
      </div>
      <h1 className="mt-4 max-w-[22ch] font-display text-[clamp(32px,4.2vw,50px)] font-extrabold leading-[1.08] tracking-[-0.035em] text-ink-900">
        {guide.title}
      </h1>
      <p className="mt-5 max-w-[58ch] text-[17px] leading-[1.65] text-ink-500">
        {guide.summary}
      </p>
    </div>
  );
}

export function GuideHeader({ guide }: { guide: Guide }) {
  return (
    <header className="relative isolate overflow-hidden border-b border-ink-100 pb-14 pt-10 lg:pb-20 lg:pt-14">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(60%_80%_at_85%_0%,var(--color-brand-50),transparent_70%)]"
      />

      <div className="rise-in mx-auto max-w-360 px-5 sm:px-8 lg:px-10">
        <Breadcrumb guide={guide} />

        <div className="mt-10 flex items-start gap-5">
          <GuideIcon
            guide={guide}
            className="hidden size-14 shrink-0 rounded-2xl sm:grid"
            iconClassName="size-6"
          />
          <GuideTitleBlock guide={guide} />
        </div>
      </div>
    </header>
  );
}
