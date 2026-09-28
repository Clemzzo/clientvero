import type { ReactNode } from "react";

import {
  AiAssistPreview,
  ClientPreview,
  FilesPreview,
  InvoicePreview,
  LeadsPreview,
  MessagesPreview,
  ProjectPreview,
  ProposalPreview,
} from "@/components/marketing/feature-previews";
import { Marquee } from "@/components/shared/marquee";

type Feature = {
  title: string;
  detail: string;
  preview: ReactNode;
};

const features: Feature[] = [
  {
    title: "Capture every enquiry",
    detail:
      "Log leads from email, referrals, or your site, track where each one stands, and turn the good ones into clients.",
    preview: <LeadsPreview />,
  },
  {
    title: "One record per client",
    detail: "Contacts, projects, proposals, invoices, and files for each client on one page.",
    preview: <ClientPreview />,
  },
  {
    title: "Proposals clients accept online",
    detail: "Send a link, see when it's opened, and get notified when it's accepted.",
    preview: <ProposalPreview />,
  },
  {
    title: "Milestones that show progress",
    detail: "Progress updates as milestones are completed, so clients always know where things stand.",
    preview: <ProjectPreview />,
  },
  {
    title: "Invoices that get paid",
    detail: "Numbered invoices, payment tracking, and an outstanding balance that stays current.",
    preview: <InvoicePreview />,
  },
  {
    title: "Files in one shared place",
    detail: "Share deliverables with each client and keep every version next to the project.",
    preview: <FilesPreview />,
  },
  {
    title: "Conversations next to the work",
    detail: "Talk to clients inside each project, so feedback never gets lost in email.",
    preview: <MessagesPreview />,
  },
  {
    title: "A first draft in seconds",
    detail: "Draft proposals, milestones, and client updates, then edit before you send.",
    preview: <AiAssistPreview />,
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <li className="flex w-[320px] shrink-0 flex-col overflow-hidden rounded-3xl border border-ink-200 bg-white sm:w-95">
      <div className="p-6 sm:p-7">
        <h3 className="font-display text-[20px] font-bold leading-snug tracking-[-0.02em] text-ink-900">
          {feature.title}
        </h3>
        <p className="mt-2 text-[14.5px] leading-[1.6] text-ink-500">{feature.detail}</p>
      </div>

      <div className="flex-1 border-t border-ink-200/70 bg-ink-50 p-5 sm:p-6">{feature.preview}</div>
    </li>
  );
}

export function Features() {
  return (
    <section aria-labelledby="features-heading" className="py-20 lg:py-28">
      <div className="mx-auto max-w-360 px-5 sm:px-8 lg:px-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-600">Features</p>
        <h2
          id="features-heading"
          className="mt-3.5 max-w-[20ch] font-display text-section-title text-ink-900"
        >
          Every step of client work, connected.
        </h2>
        <p className="mt-3.5 max-w-[52ch] text-[16px] leading-[1.6] text-ink-500">
          Each stage picks up where the last one left off, so a new enquiry becomes a paid project
          without copying details between tools.
        </p>

        <div className="mt-10 lg:mt-12">
          <Marquee label="ClientVero features" duration={80}>
            {features.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
