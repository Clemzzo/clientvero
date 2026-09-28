import Link from "next/link";
import { Activity, ArrowRight, LayoutDashboard, ListChecks, MessageSquare, Paperclip, Settings } from "lucide-react";

import { FeatureCards, ProductSection, type FeatureCard } from "@/components/marketing/product/product-section";

const projectSections: FeatureCard[] = [
  { title: "Overview", detail: "Client, budget, dates, and progress at a glance.", icon: LayoutDashboard },
  { title: "Milestones", detail: "The plan for the work and where it stands.", icon: ListChecks },
  { title: "Files", detail: "Deliverables and documents, stored securely.", icon: Paperclip },
  { title: "Messages", detail: "Talk with your client next to the work itself.", icon: MessageSquare },
  { title: "Activity", detail: "A timeline of everything that's happened.", icon: Activity },
  { title: "Settings", detail: "Update the name, dates, budget, or status.", icon: Settings },
];

export function ProjectWorkspace() {
  return (
    <ProductSection
      id="workspace"
      title="Everything about the work, in one place."
      intro="Each project has its own space for the plan, the files, and the conversation. No more digging through chats and folders."
    >
      <FeatureCards items={projectSections} />

      <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-brand-950 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <h3 className="font-display text-[17px] font-bold tracking-[-0.02em] text-white">
            Your client sees the same progress.
          </h3>
          <p className="mt-1.5 max-w-[56ch] text-[14px] leading-[1.6] text-brand-100">
            Invite them to the client portal to follow milestones, download files, and message you. Your internal notes
            stay private.
          </p>
        </div>
        <Link
          href="/product/client-portal"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg text-[14px] font-semibold text-white underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          See the client portal
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    </ProductSection>
  );
}
