import { Check } from "lucide-react";

import { BrandMark } from "@/components/auth/BrandMark";

const content = {
  title: "Your whole client business, in one calm place.",
  description:
    "Leads, proposals, projects, invoices and a client portal, connected from the first hello to the final payment.",
  benefits: [
    "Capture every lead and turn the right ones into clients.",
    "Send proposals your clients can open and accept online.",
    "Invoice in minutes and always know what you're owed.",
    "Give each client a private portal for files, messages and progress.",
  ],
} as const;

export function AuthBrandPanel() {
  return (
    <section className="relative flex h-full flex-col justify-between overflow-hidden bg-brand-950 p-16">
      <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-[0.06]" />
      <div className="relative">
        <BrandMark />
      </div>
      <BrandPanelIntro />
      <BrandPanelBenefits />
    </section>
  );
}

function BrandPanelIntro() {
  return (
    <div className="relative">
      <h2 className="max-w-[18ch] font-display text-[clamp(32px,3vw,42px)] font-extrabold leading-[1.1] tracking-[-0.035em] text-white">
        {content.title}
      </h2>
      <p className="mt-4 max-w-[44ch] text-[16px] leading-relaxed text-brand-100">{content.description}</p>
    </div>
  );
}

function BrandPanelBenefits() {
  return (
    <ul className="relative space-y-3">
      {content.benefits.map((benefit) => (
        <li key={benefit} className="flex items-start gap-3 text-[14px] leading-normal text-brand-100">
          <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-300" strokeWidth={2.5} />
          {benefit}
        </li>
      ))}
    </ul>
  );
}
