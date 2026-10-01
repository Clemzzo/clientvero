import Link from "next/link";
import { Check, ChevronRight, MousePointer2 } from "lucide-react";

import { DashboardPreview } from "@/components/marketing/DashboardPreview";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const assurances = ["No credit card required", "Set up in minutes", "Cancel anytime"];

type Cursor = {
  label: string;
  side: "left" | "right";
  position: string;
  pointer: string;
  chip: string;
};

const cursors: Cursor[] = [
  { label: "You", side: "left", position: "left-[7%] top-[22%]", pointer: "text-brand-600", chip: "bg-brand-600" },
  { label: "Client", side: "right", position: "right-[7%] top-[18%]", pointer: "text-emerald-600", chip: "bg-emerald-600" },
  { label: "Designer", side: "left", position: "left-[9%] top-[48%]", pointer: "text-violet-leaf", chip: "bg-violet-600" },
  { label: "Software Engineer", side: "right", position: "right-[9%] top-[44%]", pointer: "text-amber-600", chip: "bg-amber-700" },
];

function delay(step: number) {
  return { animationDelay: `${step * 90}ms` };
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-72 left-1/2 size-240 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-100)_0%,transparent_62%)] opacity-70"
      />

      <div className="relative mx-auto max-w-360 px-5 pt-14 text-center sm:px-8 lg:px-10 lg:pt-24">
        <Link
          href="/product/client-portal"
          style={delay(0)}
          className="rise-in inline-flex items-center gap-2.5 rounded-full border border-brand-100 bg-white py-1 pl-1 pr-3 text-[13px] font-medium text-ink-700 shadow-[0_6px_20px_-12px_rgba(7,11,24,0.25)] transition-colors hover:border-brand-200"
        >
          <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-[12px] font-semibold text-white">
            New
          </span>
          Client portal included on every plan
          <ChevronRight className="size-3.5 text-ink-400" />
        </Link>

        <h1
          style={delay(1)}
          className="rise-in mx-auto mt-8 max-w-[16ch] text-balance font-display text-[clamp(40px,6.4vw,84px)] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink-900"
        >
          Run every client from one <span className="text-brand-600">workspace</span>
        </h1>

        <p
          style={delay(2)}
          className="rise-in mx-auto mt-7 max-w-[58ch] text-balance text-[16px] leading-[1.65] text-ink-500 sm:text-[18px]"
        >
          Leads, proposals, projects, invoices, and client communication in one place, so
          nothing slips between WhatsApp, email, and spreadsheets.
        </p>

        <div
          style={delay(3)}
          className="rise-in mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:items-center"
        >
          <Button size="lg" className="rounded-lg" asChild>
            <Link href="/sign-up">Start for free</Link>
          </Button>

          <Button variant="outline" size="lg" className="rounded-lg" asChild>
            <Link href="/product/leads">Explore the product</Link>
          </Button>
        </div>

        <ul
          style={delay(4)}
          className="rise-in mt-8 flex flex-wrap justify-center gap-x-7 gap-y-3"
        >
          {assurances.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-[14px] text-ink-500">
              <span className="grid size-5 place-items-center rounded-full bg-brand-100 text-brand-700">
                <Check className="size-3" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div aria-hidden className="hidden lg:block">
          {cursors.map((cursor) => (
            <CursorTag key={cursor.label} {...cursor} />
          ))}
        </div>
      </div>

      <div style={delay(5)} className="rise-in relative mx-auto mt-16 max-w-300 px-5 sm:px-8 lg:mt-20">
        <div className="rounded-[28px] border border-brand-100 bg-brand-50/70 p-2 sm:p-3">
          <DashboardPreview />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent to-background"
        />
      </div>
    </section>
  );
}

function CursorTag({ label, side, position, pointer, chip }: Cursor) {
  return (
    <div
      className={cn(
        "absolute flex items-start gap-0.5",
        position,
        side === "left" && "flex-row-reverse",
      )}
    >
      <MousePointer2
        fill="currentColor"
        className={cn("size-6", pointer, side === "left" && "-scale-x-100")}
      />
      <span className={cn("mt-5 rounded-md px-2 py-1 text-[13px] font-medium text-white", chip)}>
        {label}
      </span>
    </div>
  );
}
