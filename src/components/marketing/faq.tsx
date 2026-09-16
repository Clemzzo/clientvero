import Link from "next/link";
import { Plus } from "lucide-react";

import { Reveal } from "@/components/shared/reveal";
import { plans } from "@/features/subscriptions/plans";

type FaqEntry = { question: string; answer: string };

function freePlanAnswer() {
  const limits = plans.find((plan) => plan.id === "free")?.limits;

  if (!limits) {
    return "Yes. Start free and upgrade to Pro or Agency when you need more.";
  }

  return `Yes. The Free plan includes up to ${limits.clients} clients, ${limits.activeProjects} active projects, and ${limits.proposalsPerMonth} proposals and ${limits.invoicesPerMonth} invoices a month. Upgrade to Pro or Agency when you need more.`;
}

const faqs: FaqEntry[] = [
  {
    question: "Who is ClientVero for?",
    answer:
      "Freelancers, consultants, and small agencies of 2–20 people who want leads, proposals, projects, invoices, and client communication in one place.",
  },
  {
    question: "Do my clients need to pay or create an account?",
    answer:
      "No. Clients never pay for ClientVero. You invite them by email, and they get secure access to their own private portal.",
  },
  {
    question: "What can my clients see in their portal?",
    answer:
      "Their projects, milestones, progress, invoices, files, and messages. Internal notes, leads, other clients, and team conversations stay private to you.",
  },
  {
    question: "Can clients pay invoices online?",
    answer:
      "Not yet. For now you send invoices from ClientVero and record payments as they arrive, so outstanding balances stay accurate. Online payments are planned.",
  },
  {
    question: "Is there a free plan?",
    answer: freePlanAnswer(),
  },
  {
    question: "Can I change or cancel my plan?",
    answer: "Yes. You can upgrade, downgrade, or cancel anytime from your billing settings.",
  },
  {
    question: "Can my team use it too?",
    answer:
      "Yes. On the Agency plan you can invite team members and give them roles, so everyone works from one shared workspace.",
  },
  {
    question: "How is my data kept private?",
    answer:
      "Each workspace is kept separate, only people you invite can see your work, and shared files are delivered through private, expiring links.",
  },
];

function FaqItem({ entry }: { entry: FaqEntry }) {
  return (
    <details className="group px-5 sm:px-6">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
        <h3 className="font-display text-[16px] font-semibold leading-snug text-ink-900">
          {entry.question}
        </h3>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink-50 text-brand-600 transition-colors group-open:bg-brand-50">
          <Plus aria-hidden className="size-4 transition-transform duration-200 group-open:rotate-45" />
        </span>
      </summary>
      <p className="max-w-[62ch] pb-5 pr-12 text-[14.5px] leading-[1.65] text-ink-500">{entry.answer}</p>
    </details>
  );
}

export function Faq({ showPricingLink = true }: { showPricingLink?: boolean }) {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="bg-ink-50 py-20 lg:py-28">
      <div className="mx-auto grid max-w-360 gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-16 lg:px-10">
        <Reveal className="lg:sticky lg:top-28">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-600">FAQ</p>
          <h2
            id="faq-heading"
            className="mt-3.5 max-w-[16ch] font-display text-[clamp(1.6rem,2.6vw,2.05rem)] font-extrabold leading-[1.15] tracking-[-0.03em] text-ink-900"
          >
            Questions, answered.
          </h2>
          <p className="mt-3.5 max-w-[42ch] text-[14.5px] leading-[1.6] text-ink-500">
            The things people usually ask before they start.
            {showPricingLink && (
              <>
                {" "}For plan details, see{" "}
                <Link
                  href="/pricing"
                  className="font-semibold text-brand-600 underline-offset-4 hover:underline"
                >
                  pricing
                </Link>
                .
              </>
            )}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="divide-y divide-ink-200 rounded-2xl border border-ink-200 bg-white">
            {faqs.map((entry) => (
              <FaqItem key={entry.question} entry={entry} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
