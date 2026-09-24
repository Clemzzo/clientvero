import Link from "next/link";
import { ArrowRight, Check, Lightbulb } from "lucide-react";

import { toneTileClasses } from "@/components/marketing/resources/guides/GuideCard";
import type { Guide } from "@/components/marketing/resources/guides/guides";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function TableOfContents({ guide }: { guide: Guide }) {
  return (
    <nav aria-label="On this page" className="lg:sticky lg:top-28">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
        On this page
      </p>
      <ol className="mt-4 space-y-1 border-l border-ink-200">
        {guide.sections.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="-ml-px flex gap-2.5 border-l border-transparent py-1.5 pl-4 text-[13.5px] leading-[1.45] text-ink-500 transition-colors duration-200 hover:border-brand-500 hover:text-ink-900"
            >
              <span className="font-mono text-[11px] leading-5 text-ink-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              {section.heading}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Takeaways({ items }: { items: string[] }) {
  return (
    <aside
      aria-labelledby="takeaways-heading"
      className="rounded-2xl border border-brand-100 bg-brand-50/60 p-6 sm:p-7"
    >
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-lg bg-white text-brand-600 ring-1 ring-brand-100">
          <Lightbulb aria-hidden className="size-4" />
        </span>
        <h2
          id="takeaways-heading"
          className="font-display text-[16px] font-bold text-ink-900"
        >
          Key takeaways
        </h2>
      </div>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-[15px] leading-[1.55] text-ink-700"
          >
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
              <Check aria-hidden className="size-3" strokeWidth={3} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 divide-y divide-ink-100 rounded-2xl border border-ink-200 bg-white">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center gap-3 px-5 py-3.5 text-[15px] text-ink-700"
        >
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
            <Check aria-hidden className="size-3" strokeWidth={3} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function TryItCard({ guide }: { guide: Guide }) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-ink-200 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(7,11,24,0.35)] sm:flex-row sm:items-center sm:p-7">
      <span
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-xl",
          toneTileClasses[guide.tone],
        )}
      >
        <guide.icon aria-hidden className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-[17px] font-bold tracking-[-0.02em] text-ink-900">
          Put this guide into practice
        </p>
        <p className="mt-1 text-[14px] leading-[1.55] text-ink-500">
          ClientVero handles this step for you, connected to everything before
          and after it.
        </p>
      </div>
      <Button variant="outline" className="rounded-lg" asChild>
        <Link href={guide.product.href}>
          {guide.product.label}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </Button>
    </div>
  );
}

export function GuideArticle({ guide }: { guide: Guide }) {
  return (
    <div className="mx-auto grid max-w-360 gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-20 lg:px-10 lg:py-20">
      <div className="hidden lg:block">
        <TableOfContents guide={guide} />
      </div>

      <article className="min-w-0 max-w-[720px]">
        <Takeaways items={guide.takeaways} />

        {guide.sections.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-heading`}
            className="scroll-mt-28 pt-14"
          >
            <p className="font-mono text-[12px] font-medium text-brand-600">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h2
              id={`${section.id}-heading`}
              className="mt-2 font-display text-[clamp(22px,2.2vw,27px)] font-extrabold leading-[1.2] tracking-[-0.03em] text-ink-900"
            >
              {section.heading}
            </h2>
            <div className="mt-4 space-y-4">
              {section.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="max-w-[68ch] text-[16.5px] leading-[1.75] text-ink-700"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            {section.checklist && <Checklist items={section.checklist} />}
          </section>
        ))}

        <div className="mt-16">
          <TryItCard guide={guide} />
        </div>
      </article>
    </div>
  );
}
