import { Building2, Eye, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ProductSection } from "@/components/marketing/product/product-section";
import { cn } from "@/lib/utils";

type Side = { title: string; caption: string; icon: LucideIcon; items: string[]; tone: "private" | "shared" };

const sides: Side[] = [
  {
    title: "Inside your workspace",
    caption: "Only your team sees this",
    icon: Building2,
    tone: "private",
    items: ["Internal notes", "Team-only conversations", "Leads and pipeline", "Your other clients"],
  },
  {
    title: "In your client's portal",
    caption: "What your client signs in to",
    icon: Eye,
    tone: "shared",
    items: ["Their projects and milestones", "Files you've shared", "Their invoices", "Messages with your team"],
  },
];

function SidePanel({ side }: { side: Side }) {
  const shared = side.tone === "shared";

  return (
    <div className={cn("p-6 sm:p-8", shared && "bg-brand-50/40")}>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "grid size-10 place-items-center rounded-xl",
            shared ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-700",
          )}
        >
          <side.icon aria-hidden className="size-4.5" />
        </div>
        <div>
          <h3 className="font-display text-[16px] font-bold tracking-[-0.02em] text-ink-900">{side.title}</h3>
          <p className="text-[12.5px] text-ink-500">{side.caption}</p>
        </div>
      </div>
      <ul className="mt-6 space-y-2.5">
        {side.items.map((item) => (
          <li
            key={item}
            className={cn(
              "rounded-xl border px-4 py-3 text-[13.5px] font-medium",
              shared ? "border-brand-100 bg-white text-ink-900" : "border-ink-200 bg-ink-50 text-ink-700",
            )}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AgencyClientView() {
  return (
    <ProductSection
      id="clients"
      title="One team behind the work, one clear view for the client."
      intro="Your team can talk freely inside the workspace. Your client gets a calm, private portal with only what belongs to them."
      className="bg-ink-50"
    >
      <div className="relative overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-[0_18px_40px_-32px_rgba(7,11,24,0.3)]">
        <div className="grid divide-y divide-ink-200 md:grid-cols-2 md:divide-x md:divide-y-0">
          {sides.map((side) => (
            <SidePanel key={side.title} side={side} />
          ))}
        </div>
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 hidden size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-ink-200 bg-white text-ink-700 shadow-[0_8px_20px_-10px_rgba(7,11,24,0.35)] md:grid"
        >
          <Lock className="size-4.5" />
        </div>
      </div>
    </ProductSection>
  );
}
