import { ProgressFill } from "@/components/marketing/dashboard-motion";
import { StatusPill } from "@/components/marketing/feature-previews";
import { agencyTeam, teamMember } from "@/components/marketing/solutions/agencies/agencyTeam";
import { TeamAvatar, TeamAvatarStack } from "@/components/marketing/solutions/agencies/TeamAvatar";

const stats = [
  { label: "Open leads", value: "12" },
  { label: "Active projects", value: "7" },
  { label: "Outstanding", value: "$18,240" },
];

const projects = [
  { name: "Website relaunch", client: "Harbor & Co.", owner: teamMember("sarah"), progress: 70 },
  { name: "Brand refresh", client: "Fieldnote", owner: teamMember("tom"), progress: 40 },
];

const activity = [
  { member: teamMember("sarah"), action: "completed Homepage build", time: "2m" },
  { member: teamMember("dee"), action: "sent INV-0031 to Harbor & Co.", time: "18m" },
];

export function AgencyWorkspacePreview() {
  return (
    <div aria-hidden className="rounded-3xl bg-ink-100 p-4 sm:p-6">
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_24px_60px_-36px_rgba(7,11,24,0.35)]">
        <div className="flex items-center justify-between gap-3 border-b border-ink-200 px-5 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-ink-900 text-[11px] font-bold text-white">
              NS
            </div>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-semibold text-ink-900">Northstar Studio</div>
              <div className="truncate text-[11.5px] text-ink-400">Shared workspace</div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <TeamAvatarStack members={agencyTeam} size={26} />
            <span className="hidden text-[11.5px] text-ink-500 sm:inline">{agencyTeam.length} members</span>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-ink-200 border-b border-ink-200">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-0 px-4 py-3.5 sm:px-5">
              <div className="truncate text-[10.5px] text-ink-400">{stat.label}</div>
              <div className="mt-1 font-display text-[18px] font-bold tabular-nums tracking-[-0.02em] text-ink-900">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <ul className="space-y-3 px-5 py-4">
          {projects.map((project) => (
            <li key={project.name} className="rounded-xl border border-ink-200 px-3.5 py-3">
              <div className="flex items-center gap-3">
                <TeamAvatar member={project.owner} size={28} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-semibold text-ink-900">{project.name}</div>
                  <div className="truncate text-[11px] text-ink-400">
                    {project.client} · {project.owner.name.split(" ")[0]}
                  </div>
                </div>
                <span className="shrink-0 text-[11.5px] font-semibold tabular-nums text-ink-700">
                  {project.progress}%
                </span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
                <ProgressFill value={project.progress} className="bg-brand-600" />
              </div>
            </li>
          ))}
        </ul>

        <div className="border-t border-ink-200 bg-ink-50 px-5 py-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">Team activity</span>
            <StatusPill tone="emerald">Live</StatusPill>
          </div>
          <ul className="mt-2.5 space-y-2">
            {activity.map((item) => (
              <li key={item.action} className="flex items-center gap-2.5 text-[12px]">
                <TeamAvatar member={item.member} size={20} />
                <span className="min-w-0 flex-1 truncate text-ink-700">
                  <span className="font-semibold text-ink-900">{item.member.name.split(" ")[0]}</span> {item.action}
                </span>
                <span className="shrink-0 text-[11px] text-ink-400">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
