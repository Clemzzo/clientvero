import Image from "next/image";
import { LayoutGrid, MessageSquare, ReceiptText, Shuffle, Users, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import solutionDiagram from "@/assets/images/solution.png";
import { Reveal } from "@/components/shared/reveal";

type Point = { title: string; detail: string; icon: LucideIcon };

const problems: Point[] = [
  {
    title: "Everything scattered",
    detail: "Leads, files, messages, and updates spread across too many separate apps.",
    icon: Shuffle,
  },
  {
    title: "Chasing payments",
    detail: "Invoices written somewhere else, then tracked by hand in a spreadsheet.",
    icon: ReceiptText,
  },
  {
    title: "Constant status updates",
    detail: "Clients can't see the work, so they keep asking where things stand.",
    icon: MessageSquare,
  },
];

const solutions: Point[] = [
  {
    title: "One workspace",
    detail: "Leads, clients, proposals, projects, files, and invoices in a single place.",
    icon: LayoutGrid,
  },
  {
    title: "Get paid without chasing",
    detail: "Send invoices, track what's paid, and let overdue reminders go out for you.",
    icon: Wallet,
  },
  {
    title: "Clients stay in the loop",
    detail: "Progress, files, invoices, and messages in their own private portal.",
    icon: Users,
  },
];

function PointList({ items }: { items: Point[] }) {
  return (
    <ul className="mt-8 space-y-5">
      {items.map((item) => (
        <li key={item.title} className="flex gap-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <item.icon className="size-4.5" strokeWidth={2} />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-[14.5px] font-semibold text-ink-900">{item.title}</p>
            <p className="mt-1 max-w-[38ch] text-[13.5px] leading-[1.55] text-ink-500">
              {item.detail}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Column({
  headingId,
  eyebrow,
  heading,
  intro,
  items,
}: {
  headingId: string;
  eyebrow: string;
  heading: string;
  intro: string;
  items: Point[];
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-600">{eyebrow}</p>

      <h2
        id={headingId}
        className="mt-3.5 max-w-[16ch] font-display text-[clamp(26px,2.6vw,33px)] font-extrabold leading-[1.15] tracking-[-0.03em] text-ink-900"
      >
        {heading}
      </h2>

      <p className="mt-3.5 max-w-[42ch] text-[14.5px] leading-[1.6] text-ink-500">{intro}</p>

      <PointList items={items} />
    </div>
  );
}

function Diagram() {
  return (
    <div className="relative mx-auto w-full max-w-125 lg:max-w-none">
      <Image
        src={solutionDiagram}
        alt=""
        sizes="(min-width: 1024px) 34vw, 100vw"
        className="h-auto w-full"
      />
    </div>
  );
}

export function Problem() {
  return (
    <section aria-labelledby="problem-heading" className="bg-ink-50 py-20 lg:py-28">
      <div className="mx-auto max-w-360 px-5 sm:px-8 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)_minmax(0,1fr)] lg:items-start lg:gap-8 xl:gap-12">
          <Reveal>
            <Column
              headingId="problem-heading"
              eyebrow="The problem"
              heading="Managing clients shouldn't be this hard."
              intro="Scattered conversations, missed follow-ups, and invoices tracked by hand slow you down and wear on the client relationship."
              items={problems}
            />
          </Reveal>

          <Reveal delay={0.12} className="lg:self-center">
            <Diagram />
          </Reveal>

          <Reveal delay={0.24}>
            <Column
              headingId="solution-heading"
              eyebrow="The solution"
              heading="Everything together. Finally."
              intro="ClientVero brings your whole client workflow into one place, from first enquiry to final payment."
              items={solutions}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
