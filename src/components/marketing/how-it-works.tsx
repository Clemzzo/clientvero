import { CornerDownRight } from "lucide-react";

import { Reveal } from "@/components/shared/reveal";

type Step = { title: string; detail: string; outcome: string };

const steps: Step[] = [
  {
    title: "Set up your workspace",
    detail: "Add your name or business name, logo, and currency. It takes a few minutes.",
    outcome: "Invoices and proposals with your branding.",
  },
  {
    title: "Add your clients",
    detail: "Create clients directly or convert a lead once they're ready to work with you.",
    outcome: "One place for everything you share with them.",
  },
  {
    title: "Send a proposal",
    detail:
      "Write it yourself or start with an AI draft, then send a link. When they accept, turn it into a project.",
    outcome: "A proposal they can read and accept online.",
  },
  {
    title: "Invite them and get paid",
    detail:
      "Invite your client to their portal, share progress, and send invoices. Record payments as they come in.",
    outcome: "Progress, files, and invoices in their portal.",
  },
];

function StepItem({ step, index }: { step: Step; index: number }) {
  const headingId = `how-it-works-step-${index + 1}`;

  return (
    <li className="flex flex-col gap-5">
      <span
        aria-hidden
        className="font-display text-[clamp(3.5rem,5vw,4.5rem)] font-medium leading-none tracking-[-0.04em] text-brand-200"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <article
        aria-labelledby={headingId}
        className="flex flex-1 flex-col rounded-2xl border border-ink-200 bg-ink-50 p-5 sm:p-6"
      >
        <div className="flex-1">
          <h3
            id={headingId}
            className="font-display text-[17px] font-bold leading-snug tracking-[-0.02em] text-ink-900"
          >
            <span className="sr-only">Step {index + 1}: </span>
            {step.title}
          </h3>
          <p className="mt-2 text-[14px] leading-[1.6] text-ink-500">{step.detail}</p>
        </div>

        <p className="mt-5 flex gap-2 border-t border-ink-200 pt-4 text-[13px] leading-normal text-ink-500">
          <CornerDownRight aria-hidden className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
          <span>
            <span className="font-semibold text-ink-700">Your client gets: </span>
            {step.outcome}
          </span>
        </p>
      </article>
    </li>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-heading" className="py-20 lg:py-28">
      <div className="mx-auto max-w-360 px-5 sm:px-8 lg:px-10">
        <Reveal className="grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-12">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-600">How it works</p>
            <h2
              id="how-it-works-heading"
              className="mt-3.5 max-w-[20ch] font-display text-[clamp(1.6rem,2.6vw,2.05rem)] font-extrabold leading-[1.15] tracking-[-0.03em] text-ink-900"
            >
              From sign-up to first payment in four steps.
            </h2>
          </div>
          <p className="max-w-[46ch] text-[14.5px] leading-[1.6] text-ink-500 lg:justify-self-end">
            No setup project, no migration. Start with one client and add the rest as you go.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12 lg:mt-14">
          <ol className="grid gap-x-5 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <StepItem key={step.title} step={step} index={index} />
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
