import Image from "next/image";
import Link from "next/link";

import logoMark from "@/assets/images/clientverologo.png";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { plans } from "@/features/subscriptions/plans";

function freePlanLine() {
  const clients = plans.find((plan) => plan.id === "free")?.limits.clients;

  return clients
    ? `Start free with up to ${clients} clients. No credit card required.`
    : "Start free today. No credit card required.";
}

export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-heading" className="pb-12 pt-20 lg:pb-16 lg:pt-28">
      <div className="mx-auto max-w-360 px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-3xl bg-brand-950 px-6 py-14 text-center sm:px-12 lg:py-20">
            <Image
              src={logoMark}
              alt=""
              aria-hidden
              sizes="(min-width: 1024px) 360px, 220px"
              className="pointer-events-none absolute -bottom-16 -right-12 -z-10 h-auto w-55 opacity-10 select-none sm:-bottom-20 sm:-right-10 lg:w-90"
            />

            <h2
              id="final-cta-heading"
              className="mx-auto max-w-[20ch] font-display text-[clamp(1.9rem,3.6vw,2.75rem)] font-extrabold leading-[1.1] tracking-[-0.035em] text-white"
            >
              Run your entire client business from one place.
            </h2>
            <p className="mx-auto mt-5 max-w-[46ch] text-[16px] leading-[1.6] text-brand-100">
              {freePlanLine()}
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="rounded-lg bg-white text-brand-950 hover:bg-brand-50 focus-visible:outline-white"
                asChild
              >
                <Link href="/sign-up">Start for free</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-lg border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/10 focus-visible:outline-white"
                asChild
              >
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
