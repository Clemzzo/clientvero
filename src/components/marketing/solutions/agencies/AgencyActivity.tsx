import { Bell, History, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ProductSection } from "@/components/marketing/product/product-section";
import { teamMember, type TeamMember } from "@/components/marketing/solutions/agencies/agencyTeam";
import { TeamAvatar } from "@/components/marketing/solutions/agencies/TeamAvatar";

const events: { member: TeamMember; action: string; target: string; time: string }[] = [
  { member: teamMember("dee"), action: "recorded a payment on", target: "INV-0029", time: "9:12" },
  { member: teamMember("olivia"), action: "sent a proposal to", target: "Kite Health", time: "10:40" },
  { member: teamMember("sarah"), action: "completed milestone", target: "Homepage build", time: "11:05" },
  { member: teamMember("tom"), action: "uploaded", target: "Fieldnote logo v3.pdf", time: "13:22" },
  { member: teamMember("dee"), action: "messaged", target: "Harbor & Co.", time: "14:48" },
];

const tiles: { title: string; detail: string; icon: LucideIcon }[] = [
  {
    title: "An activity log, by name",
    detail: "Every proposal, milestone, invoice, and file change is recorded with who did it and when.",
    icon: History,
  },
  {
    title: "Notifications that matter",
    detail: "Hear about it when a client accepts a proposal, pays an invoice, or sends a message.",
    icon: Bell,
  },
  {
    title: "One record per client",
    detail: "No more asking which spreadsheet, thread, or folder has the latest version.",
    icon: UsersRound,
  },
];

function ActivityTimeline() {
  return (
    <div aria-hidden className="rounded-3xl bg-white/5 p-3 ring-1 ring-white/10 sm:p-4">
      <div className="rounded-2xl bg-white p-5 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between">
          <span className="font-display text-[15px] font-bold text-ink-900">Today</span>
          <span className="text-[11.5px] text-ink-400">Northstar Studio</span>
        </div>
        <ol className="mt-4">
          {events.map((event, index) => (
            <li key={`${event.target}-${event.time}`} className="relative flex gap-3 pb-4 last:pb-0">
              {index < events.length - 1 && <div className="absolute bottom-0 left-3.75 top-8 w-px bg-ink-200" />}
              <TeamAvatar member={event.member} size={30} />
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[12.5px] leading-snug text-ink-500">
                  <span className="font-semibold text-ink-900">{event.member.name.split(" ")[0]}</span> {event.action}{" "}
                  <span className="font-medium text-ink-700">{event.target}</span>
                </p>
                <p className="mt-0.5 text-[11px] tabular-nums text-ink-400">{event.time}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function AgencyActivity() {
  return (
    <ProductSection
      id="activity"
      title="See what moved, and who moved it."
      intro="Stand-ups get shorter when the workspace already shows the day. Everyone sees the same picture of every client."
      dark
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <ActivityTimeline />
        <ul className="space-y-4">
          {tiles.map((tile) => (
            <li
              key={tile.title}
              className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors duration-200 hover:bg-white/8 motion-reduce:transition-none"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-200">
                <tile.icon aria-hidden className="size-4.5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-[16px] font-bold tracking-[-0.02em] text-white">{tile.title}</h3>
                <p className="mt-1 text-[13.5px] leading-[1.6] text-brand-100">{tile.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ProductSection>
  );
}
