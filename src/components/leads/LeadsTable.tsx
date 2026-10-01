import Link from "next/link";

import { RowDeleteMenu } from "@/components/shared/RowDeleteMenu";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Lead } from "@/db/schema";
import { leadValue } from "@/features/leads/lead-display";
import { leadStatusLabels, leadStatusTones } from "@/features/leads/lead-status";
import { formatRelativeTime } from "@/lib/utils/format";
import { deleteLeadAction } from "@/server/actions/leads";

type LeadsTableProps = {
  leads: Lead[];
  canDelete: boolean;
};

const headerCell = "px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-500";

function LeadDeleteMenu({ lead }: { lead: Lead }) {
  return (
    <RowDeleteMenu
      name={lead.name}
      description="This lead will be removed from your leads and pipeline."
      onDelete={deleteLeadAction.bind(null, lead.id)}
    />
  );
}

export function LeadsTable({ leads, canDelete }: LeadsTableProps) {
  const now = new Date();

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
      <table className="hidden w-full md:table">
        <thead className="border-b border-ink-200 bg-ink-50">
          <tr>
            <th scope="col" className={headerCell}>Lead</th>
            <th scope="col" className={headerCell}>Status</th>
            <th scope="col" className={`${headerCell} text-right`}>Value</th>
            <th scope="col" className={headerCell}>Source</th>
            <th scope="col" className={`${headerCell} text-right`}>Added</th>
            {canDelete && (
              <th scope="col" className="w-14">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-200">
          {leads.map((lead) => (
            <tr key={lead.id} className="transition-colors hover:bg-ink-50">
              <td className="max-w-80 px-4 py-3.5">
                <Link
                  href={`/dashboard/leads/${lead.id}`}
                  className="block truncate text-[14px] font-semibold text-ink-900 hover:text-brand-700"
                >
                  {lead.name}
                </Link>
                <p className="truncate text-[13px] text-ink-500">{lead.company ?? lead.email ?? "—"}</p>
              </td>
              <td className="px-4 py-3.5">
                <StatusBadge label={leadStatusLabels[lead.status]} tone={leadStatusTones[lead.status]} />
              </td>
              <td className="px-4 py-3.5 text-right text-[14px] font-medium text-ink-900 tabular-nums">
                {leadValue(lead) ?? "—"}
              </td>
              <td className="px-4 py-3.5 text-[14px] text-ink-500">{lead.source ?? "—"}</td>
              <td className="px-4 py-3.5 text-right text-[13px] text-ink-500">
                <time dateTime={lead.createdAt.toISOString()}>{formatRelativeTime(lead.createdAt, now)}</time>
              </td>
              {canDelete && (
                <td className="py-3.5 pr-3 text-right">
                  <LeadDeleteMenu lead={lead} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-ink-200 md:hidden">
        {leads.map((lead) => (
          <li key={lead.id} className="flex items-start gap-1 hover:bg-ink-50">
            <Link href={`/dashboard/leads/${lead.id}`} className="block min-w-0 flex-1 px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-ink-900">{lead.name}</p>
                  <p className="truncate text-[13px] text-ink-500">{lead.company ?? lead.email ?? "—"}</p>
                </div>
                <StatusBadge label={leadStatusLabels[lead.status]} tone={leadStatusTones[lead.status]} />
              </div>
              <p className="mt-2 flex justify-between text-[13px] text-ink-500">
                <span className="font-medium text-ink-900 tabular-nums">{leadValue(lead) ?? "No value"}</span>
                <time dateTime={lead.createdAt.toISOString()}>{formatRelativeTime(lead.createdAt, now)}</time>
              </p>
            </Link>
            {canDelete && (
              <div className="py-3 pr-2">
                <LeadDeleteMenu lead={lead} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
