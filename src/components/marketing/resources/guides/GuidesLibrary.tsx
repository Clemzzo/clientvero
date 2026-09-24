"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";

import {
  focusRing,
  GuideCard,
} from "@/components/marketing/resources/guides/GuideCard";
import {
  guides,
  guideStages,
  type Guide,
  type GuideStage,
} from "@/components/marketing/resources/guides/guides";
import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

type Filter = GuideStage | "all";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All guides" },
  ...guideStages,
];

function filterGuides(filter: Filter) {
  return filter === "all"
    ? guides
    : guides.filter((guide) => guide.stage === filter);
}

function LibraryIntro() {
  return (
    <div>
      <h2
        id="library-heading"
        className="font-display text-[clamp(26px,2.6vw,33px)] font-extrabold leading-[1.15] tracking-[-0.03em] text-ink-900"
      >
        Browse the library.
      </h2>
      <p className="mt-3.5 max-w-[52ch] text-[16px] leading-[1.6] text-ink-500">
        Pick the step you&apos;re working on, or read them in order to set up
        the whole workflow.
      </p>
    </div>
  );
}

function FilterBar({
  active,
  onChange,
}: {
  active: Filter;
  onChange: (filter: Filter) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filter guides by step"
      className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
    >
      {filters.map((filter) => {
        const isActive = active === filter.id;

        return (
          <button
            key={filter.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(filter.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-200",
              focusRing,
              isActive
                ? "bg-ink-900 text-white"
                : "bg-white text-ink-500 ring-1 ring-ink-200 hover:text-ink-900 hover:ring-ink-400/40",
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

function GuideGrid({ items }: { items: Guide[] }) {
  return (
    <ul aria-live="polite" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((guide) => (
        <li key={guide.slug}>
          <GuideCard guide={guide} />
        </li>
      ))}
    </ul>
  );
}

function EmptyLibrary({ onShowAll }: { onShowAll: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-ink-100 text-ink-500">
        <BookOpen aria-hidden className="size-5" />
      </span>
      <p className="mt-4 font-display text-[17px] font-bold text-ink-900">
        No guides for this step yet
      </p>
      <p className="mt-1.5 max-w-[40ch] text-[14px] text-ink-500">
        We&apos;re writing more. In the meantime, browse the full library.
      </p>
      <button
        type="button"
        onClick={onShowAll}
        className="mt-5 text-[14px] font-semibold text-brand-700 hover:text-brand-600"
      >
        Show all guides
      </button>
    </div>
  );
}

export function GuidesLibrary() {
  const [active, setActive] = useState<Filter>("all");
  const visible = filterGuides(active);

  return (
    <section
      id="library"
      aria-labelledby="library-heading"
      className="border-t border-ink-100 bg-ink-50/60 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-360 px-5 sm:px-8 lg:px-10">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <LibraryIntro />
          <FilterBar active={active} onChange={setActive} />
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          {visible.length > 0 ? (
            <GuideGrid items={visible} />
          ) : (
            <EmptyLibrary onShowAll={() => setActive("all")} />
          )}
        </Reveal>
      </div>
    </section>
  );
}
