import { Check, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PortalPreview } from "@/components/marketing/portal-preview";
import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

const visible = ["Project progress", "Milestones", "Invoices", "Files and messages"];

const privateItems = ["Internal notes", "Leads and pipeline", "Other clients", "Team conversations"];

function BoundaryList({
  headingId,
  heading,
  items,
  icon: Icon,
  iconClassName,
}: {
  headingId: string;
  heading: string;
  items: string[];
  icon: LucideIcon;
  iconClassName: string;
}) {
  return (
    <div>
      <h3 id={headingId} className="text-[14px] font-semibold text-white">
        {heading}
      </h3>
      <ul aria-labelledby={headingId} className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-[14px] text-brand-100">
            <span className={cn("grid size-5 shrink-0 place-items-center rounded-full", iconClassName)}>
              <Icon aria-hidden className="size-3" strokeWidth={2.5} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PortalShowcase() {
  return (
    <section id="portal" aria-labelledby="portal-heading" className="bg-brand-950 py-20 lg:py-28">
      <div className="mx-auto grid max-w-360 gap-14 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16 lg:px-10">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-300">Client portal</p>

          <h2
            id="portal-heading"
            className="mt-3.5 max-w-[16ch] font-display text-[clamp(1.6rem,2.6vw,2.05rem)] font-extrabold leading-[1.15] tracking-[-0.03em] text-white"
          >
            A private portal for every client.
          </h2>

          <p className="mt-3.5 max-w-[46ch] text-[14.5px] leading-[1.6] text-brand-100">
            Invite clients to their own space to follow progress, view invoices, download files, and
            message you. No more status-update emails.
          </p>

          <div className="mt-10 grid gap-8 border-t border-white/10 pt-8 sm:grid-cols-2">
            <BoundaryList
              headingId="portal-visible"
              heading="Your client sees"
              items={visible}
              icon={Check}
              iconClassName="bg-brand-500 text-white"
            />
            <BoundaryList
              headingId="portal-private"
              heading="Stays private to you"
              items={privateItems}
              icon={Lock}
              iconClassName="bg-white/10 text-brand-200"
            />
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <PortalPreview />
        </Reveal>
      </div>
    </section>
  );
}
