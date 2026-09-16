import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

import danielAvatar from "@/assets/images/dk.png";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { Button } from "@/components/ui/button";

const assurances = ["No credit card required", "Set up in minutes", "Cancel anytime"];

function delay(step: number) {
  return { animationDelay: `${step * 90}ms` };
}

export function Hero() {
  return (
    <section className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-56 size-184 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-100)_0%,transparent_62%)] opacity-70" />
        <div className="absolute -left-52 top-40 size-136 rounded-full bg-[radial-gradient(circle_at_center,#ede9fe_0%,transparent_65%)] opacity-60" />
      </div>

      <div className="relative mx-auto grid max-w-360 gap-14 px-5 pb-24 pt-10 sm:px-8 lg:grid-cols-[minmax(0,0.93fr)_minmax(0,1.07fr)] lg:items-start lg:gap-12 lg:px-10 lg:pb-36 lg:pt-16 xl:pt-25">
        <div>
          <p
            style={delay(0)}
            className="rise-in inline-flex items-center rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-brand-700"
          >
            All-in-one client management
          </p>

          <h1
            style={delay(1)}
            className="rise-in mt-7 max-w-[17ch] font-display text-[clamp(2.6rem,5.7vw,4.25rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink-900"
          >
            Turn clients into long-term <span className="text-brand-600">growth</span>
            <span className="text-brand-300">.</span>
          </h1>

          <p
            style={delay(2)}
            className="rise-in mt-7 max-w-[57ch] text-[16px] leading-[1.65] text-ink-500"
          >
            ClientVero gives freelancers and small agencies one workspace for leads, proposals,
            projects, payments, and client communication without jumping between WhatsApp, email,
            spreadsheets, and separate tools.
          </p>

          <div
            style={delay(3)}
            className="rise-in mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button size="lg" className="rounded-lg" asChild>
              <Link href="/sign-up">
                Start free trial
              </Link>
            </Button>

            <Button variant="outline" size="lg" className="rounded-lg" asChild>
              <Link href="#how-it-works">
                See how it works
              </Link>
            </Button>
          </div>

          <ul style={delay(4)} className="rise-in mt-9 flex flex-wrap gap-x-7 gap-y-3">
            {assurances.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-[14px] text-ink-500">
                <span className="grid size-5 place-items-center rounded-full bg-brand-100 text-brand-700">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div style={delay(3)} className="rise-in relative lg:pt-1">
          <DashboardPreview />
          <Testimonial />
        </div>
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <figure className="mt-5 max-w-86 rounded-2xl border border-ink-200 bg-white p-4 shadow-[0_24px_60px_-28px_rgba(7,11,24,0.35)] lg:absolute lg:-bottom-24 lg:right-0 lg:mt-0">
      <div className="flex gap-3.5">
        <Image
          src={danielAvatar}
          alt=""
          loading="eager"
          sizes="44px"
          className="size-11 shrink-0 rounded-xl object-cover"
        />
        <div>
          <blockquote className="text-[13px] leading-[1.55] text-ink-700">
            “ClientVero has completely streamlined our client process. We&rsquo;re more organised,
            more productive, and our clients love it.”
          </blockquote>
          <figcaption className="mt-2.5 text-[12.5px]">
            <span className="font-semibold text-ink-900">Daniel Kim</span>
            <span className="block text-ink-400">Founder, Pixel &amp; Co.</span>
          </figcaption>
        </div>
      </div>
    </figure>
  );
}
