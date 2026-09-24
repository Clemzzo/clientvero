import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { GuideCard } from "@/components/marketing/resources/guides/GuideCard";
import {
  getNextGuide,
  guides,
  type Guide,
} from "@/components/marketing/resources/guides/guides";
import { Reveal } from "@/components/shared/reveal";

const RELATED_COUNT = 2;

function keepReadingGuides(current: Guide) {
  const next = getNextGuide(current.slug);
  const related = guides
    .filter((guide) => guide.slug !== current.slug && guide.slug !== next.slug)
    .slice(0, RELATED_COUNT);

  return { next, cards: [next, ...related] };
}

function KeepReadingHeader() {
  return (
    <Reveal className="flex flex-wrap items-end justify-between gap-4">
      <h2
        id="keep-reading-heading"
        className="font-display text-[clamp(24px,2.4vw,30px)] font-extrabold tracking-[-0.03em] text-ink-900"
      >
        Keep reading.
      </h2>
      <Link
        href="/guides"
        className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-700 hover:text-brand-600"
      >
        All guides
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      </Link>
    </Reveal>
  );
}

function NextStepBadge() {
  return (
    <span className="absolute -top-2.5 left-6 z-10 rounded-full bg-ink-900 px-2.5 py-0.5 text-[11px] font-semibold text-white">
      Next step
    </span>
  );
}

export function GuideNext({ guide }: { guide: Guide }) {
  const { next, cards } = keepReadingGuides(guide);

  return (
    <section
      aria-labelledby="keep-reading-heading"
      className="border-t border-ink-100 bg-ink-50/60 py-20 lg:py-24"
    >
      <div className="mx-auto max-w-360 px-5 sm:px-8 lg:px-10">
        <KeepReadingHeader />

        <Reveal delay={0.1} className="mt-10">
          <ul className="grid gap-5 md:grid-cols-3">
            {cards.map((card) => (
              <li key={card.slug} className="relative">
                {card.slug === next.slug && <NextStepBadge />}
                <GuideCard guide={card} />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
