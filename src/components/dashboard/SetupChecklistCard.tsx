import Link from "next/link";
import { Check, ChevronRight, Rocket } from "lucide-react";

import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type SetupStep = {
  label: string;
  done: boolean;
  href?: string;
};

type SetupChecklistCardProps = {
  steps: SetupStep[];
};

function StepContent({ step }: { step: SetupStep }) {
  return (
    <>
      <span
        aria-hidden
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full border",
          step.done ? "border-mint-600 bg-mint-600 text-white" : "border-ink-200 bg-white",
        )}
      >
        {step.done && <Check className="size-3" strokeWidth={3} />}
      </span>
      <span
        className={cn(
          "flex-1",
          step.done && "text-ink-500 line-through decoration-ink-200",
          !step.done && (step.href ? "text-ink-900" : "text-ink-500"),
        )}
      >
        {step.label}
        <span className="sr-only">{step.done ? " (done)" : " (to do)"}</span>
      </span>
    </>
  );
}

export function SetupChecklistCard({ steps }: SetupChecklistCardProps) {
  const completed = steps.filter((step) => step.done).length;
  const progress = Math.round((completed / steps.length) * 100);

  return (
    <Card>
      <CardHeader
        title="Get set up"
        description={`${completed} of ${steps.length} complete`}
        icon={{ node: <Rocket />, tone: "ocean" }}
      />

      <div
        role="progressbar"
        aria-label="Setup progress"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mx-5 mt-4 h-1.5 overflow-hidden rounded-full bg-ink-100 sm:mx-6"
      >
        <div className="h-full rounded-full bg-mint-500" style={{ width: `${progress}%` }} />
      </div>

      <ul className="mt-3 px-3 pb-3 sm:px-4">
        {steps.map((step) => (
          <li key={step.label}>
            {step.href && !step.done ? (
              <Link
                href={step.href}
                className="group flex items-center gap-3 rounded-lg px-2 py-2.5 text-[14px] font-medium transition-colors hover:bg-ink-50"
              >
                <StepContent step={step} />
                <ChevronRight aria-hidden className="size-4 text-ink-500 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-3 px-2 py-2.5 text-[14px] font-medium">
                <StepContent step={step} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
