import Image from "next/image";
import { Lock, Mail, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import holandAvatar from "@/assets/images/holand.png";
import jamesAvatar from "@/assets/images/james.png";
import mikeAvatar from "@/assets/images/mike.png";
import { StatusPill } from "@/components/marketing/feature-previews";
import { ProductSection } from "@/components/marketing/product/product-section";
import { cn } from "@/lib/utils";

const contacts = [
  { name: "James Carter", role: "COO", primary: true, avatar: jamesAvatar },
  { name: "Holand Brooks", role: "Finance lead", primary: false, avatar: holandAvatar },
  { name: "Mike Hansen", role: "Project sponsor", primary: false, avatar: mikeAvatar },
];

const features: { title: string; detail: string; icon: LucideIcon }[] = [
  {
    title: "Several contacts, one client",
    detail: "Keep everyone you work with on the client's side, with their role and a primary contact.",
    icon: Users,
  },
  {
    title: "Invite them to the portal",
    detail: "Give the client a private portal to follow the engagement, read reports, and reply.",
    icon: Mail,
  },
  {
    title: "Your notes stay yours",
    detail: "Internal notes and your pipeline never appear in anything the client can see.",
    icon: Lock,
  },
];

function ClientRecordMockup() {
  return (
    <div aria-hidden className="rounded-3xl bg-ink-100 p-4 sm:p-6">
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_24px_60px_-36px_rgba(7,11,24,0.35)]">
        <div className="flex items-center gap-3 border-b border-ink-200 px-5 py-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink-900 text-[12px] font-bold text-white">
            NG
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-semibold text-ink-900">Northwind Group</div>
            <div className="truncate text-[11.5px] text-ink-400">northwind.co · Client since August</div>
          </div>
          <StatusPill tone="emerald">Portal on</StatusPill>
        </div>

        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">Contacts</p>
          <ul className="mt-3 space-y-2">
            {contacts.map((contact) => (
              <li
                key={contact.name}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                  contact.primary ? "border-brand-200 bg-brand-50/50" : "border-ink-200",
                )}
              >
                <Image
                  src={contact.avatar}
                  alt=""
                  sizes="32px"
                  className="size-8 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-semibold text-ink-900">{contact.name}</div>
                  <div className="truncate text-[11px] text-ink-400">{contact.role}</div>
                </div>
                {contact.primary && <StatusPill tone="brand">Primary</StatusPill>}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2 border-t border-dashed border-ink-200 px-5 py-3.5 text-[11.5px] text-ink-500">
          <Lock className="size-3.5 text-ink-400" />
          Internal note · only visible to you
        </div>
      </div>
    </div>
  );
}

export function ConsultantStakeholders() {
  return (
    <ProductSection
      id="stakeholders"
      title="Every stakeholder, one client record."
      intro="Consulting rarely means one contact. Keep the whole client team, the work, and the history in one place."
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <ClientRecordMockup />

        <ul className="space-y-4">
          {features.map((feature) => (
            <li key={feature.title} className="flex gap-4 rounded-2xl border border-ink-200 bg-white p-5">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <feature.icon aria-hidden className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-[16px] font-bold tracking-[-0.02em] text-ink-900">{feature.title}</h3>
                <p className="mt-1 text-[14px] leading-[1.6] text-ink-500">{feature.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ProductSection>
  );
}
