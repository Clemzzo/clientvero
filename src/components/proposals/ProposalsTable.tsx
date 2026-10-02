import Link from "next/link";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { proposalStatusLabels, proposalStatusTones } from "@/features/proposals/proposal-status";
import { formatMoney, formatRelativeTime } from "@/lib/utils/format";
import type { ProposalListRow } from "@/server/repositories/proposal.repository";

type ProposalsTableProps = {
  proposals: ProposalListRow[];
  showClient?: boolean;
};

const headerCell = "px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-500";

function respondedAt(proposal: ProposalListRow) {
  return proposal.acceptedAt ?? proposal.declinedAt;
}

function RelativeDate({ date, now }: { date: Date | null; now: Date }) {
  return date ? <time dateTime={date.toISOString()}>{formatRelativeTime(date, now)}</time> : <span>—</span>;
}

export function ProposalsTable({ proposals, showClient = true }: ProposalsTableProps) {
  const now = new Date();

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
      <table className="hidden w-full md:table">
        <thead className="border-b border-ink-200 bg-ink-50">
          <tr>
            <th scope="col" className={headerCell}>Proposal</th>
            <th scope="col" className={headerCell}>Status</th>
            <th scope="col" className={`${headerCell} text-right`}>Total</th>
            <th scope="col" className={`${headerCell} text-right`}>Sent</th>
            <th scope="col" className={`${headerCell} text-right`}>Responded</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-200">
          {proposals.map((proposal) => (
            <tr key={proposal.id} className="transition-colors hover:bg-ink-50">
              <td className="max-w-96 px-4 py-3.5">
                <Link
                  href={`/dashboard/proposals/${proposal.id}`}
                  className="block truncate text-[14px] font-semibold text-ink-900 hover:text-brand-700"
                >
                  {proposal.title}
                </Link>
                {showClient && <p className="truncate text-[13px] text-ink-500">{proposal.clientName}</p>}
              </td>
              <td className="px-4 py-3.5">
                <StatusBadge label={proposalStatusLabels[proposal.status]} tone={proposalStatusTones[proposal.status]} />
              </td>
              <td className="px-4 py-3.5 text-right text-[14px] font-medium tabular-nums text-ink-900">
                {formatMoney(proposal.total, proposal.currency)}
              </td>
              <td className="px-4 py-3.5 text-right text-[13px] text-ink-500">
                <RelativeDate date={proposal.sentAt} now={now} />
              </td>
              <td className="px-4 py-3.5 text-right text-[13px] text-ink-500">
                <RelativeDate date={respondedAt(proposal)} now={now} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-ink-200 md:hidden">
        {proposals.map((proposal) => (
          <li key={proposal.id}>
            <Link href={`/dashboard/proposals/${proposal.id}`} className="block px-4 py-3.5 hover:bg-ink-50">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-ink-900">{proposal.title}</p>
                  {showClient && <p className="truncate text-[13px] text-ink-500">{proposal.clientName}</p>}
                </div>
                <StatusBadge label={proposalStatusLabels[proposal.status]} tone={proposalStatusTones[proposal.status]} />
              </div>
              <p className="mt-2 flex justify-between text-[13px] text-ink-500">
                <span className="font-medium tabular-nums text-ink-900">{formatMoney(proposal.total, proposal.currency)}</span>
                <RelativeDate date={proposal.sentAt ?? proposal.createdAt} now={now} />
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
