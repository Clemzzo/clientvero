import { Check, Minus, UserPlus } from "lucide-react";

import { StatusPill, type Tone } from "@/components/marketing/feature-previews";
import { ProductSection } from "@/components/marketing/product/product-section";
import { agencyTeam, type TeamMember } from "@/components/marketing/solutions/agencies/agencyTeam";
import { TeamAvatar } from "@/components/marketing/solutions/agencies/TeamAvatar";

const permissions: { label: string; members: boolean }[] = [
  { label: "Leads and clients", members: true },
  { label: "Proposals and projects", members: true },
  { label: "Create and send invoices", members: true },
  { label: "Workspace settings", members: false },
  { label: "Invite and manage the team", members: false },
  { label: "ClientVero plan and billing", members: false },
];

const roleTones: Record<TeamMember["role"], Tone> = {
  Owner: "brand",
  Admin: "violet",
  Member: "ink",
};

function AccessMark({ allowed }: { allowed: boolean }) {
  return allowed ? (
    <div className="mx-auto grid size-6 place-items-center rounded-full bg-brand-50 text-brand-600">
      <Check aria-hidden className="size-3.5" strokeWidth={3} />
      <span className="sr-only">Included</span>
    </div>
  ) : (
    <div className="mx-auto grid size-6 place-items-center rounded-full bg-ink-100 text-ink-400">
      <Minus aria-hidden className="size-3.5" strokeWidth={3} />
      <span className="sr-only">Not included</span>
    </div>
  );
}

function PermissionTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_18px_40px_-32px_rgba(7,11,24,0.3)]">
      <table className="w-full text-left">
        <caption className="border-b border-ink-200 px-5 py-4 text-left">
          <span className="block font-display text-[16px] font-bold tracking-[-0.02em] text-ink-900">
            Who can do what
          </span>
          <span className="mt-0.5 block text-[13px] text-ink-500">Set by role when you invite someone.</span>
        </caption>
        <thead>
          <tr className="bg-ink-50 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">
            <th scope="col" className="px-5 py-3 font-semibold">
              Access
            </th>
            <th scope="col" className="w-28 px-2 py-3 text-center font-semibold">
              Owners &amp; admins
            </th>
            <th scope="col" className="w-24 px-2 py-3 text-center font-semibold">
              Members
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-200">
          {permissions.map((permission) => (
            <tr key={permission.label}>
              <th scope="row" className="px-5 py-3.5 text-[13.5px] font-medium text-ink-700">
                {permission.label}
              </th>
              <td className="px-2 py-3.5">
                <AccessMark allowed />
              </td>
              <td className="px-2 py-3.5">
                <AccessMark allowed={permission.members} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TeamRoster() {
  return (
    <div aria-hidden className="rounded-3xl bg-ink-100 p-4 sm:p-6">
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_24px_60px_-36px_rgba(7,11,24,0.35)]">
        <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
          <span className="font-display text-[15px] font-bold text-ink-900">Team</span>
          <span className="text-[11.5px] text-ink-400">{agencyTeam.length} of 20 seats</span>
        </div>
        <ul className="divide-y divide-ink-100 px-5">
          {agencyTeam.map((member) => (
            <li key={member.id} className="flex items-center gap-3 py-3">
              <TeamAvatar member={member} size={34} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-ink-900">{member.name}</div>
                <div className="truncate text-[11.5px] text-ink-400">{member.title}</div>
              </div>
              <StatusPill tone={roleTones[member.role]}>{member.role}</StatusPill>
            </li>
          ))}
        </ul>
        <div className="px-5 pb-4">
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-ink-200 px-3 py-2.5 text-[12.5px] font-semibold text-brand-600">
            <div className="grid size-8 place-items-center rounded-full bg-brand-50">
              <UserPlus className="size-4" />
            </div>
            Invite teammate
          </div>
        </div>
      </div>
    </div>
  );
}

export function AgencyRoles() {
  return (
    <ProductSection
      id="roles"
      title="Everyone gets the access they need."
      intro="Invite your team into one workspace. Owners and admins run the business side, and members get straight to the client work."
      className="bg-ink-50"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-14">
        <PermissionTable />
        <TeamRoster />
      </div>
    </ProductSection>
  );
}
