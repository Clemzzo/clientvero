import type { ReactNode } from "react";

import { formatRelativeTime } from "@/lib/utils/format";
import type { ArchivedRecord } from "@/types/archived-record";

type ArchivedRecordsTableProps = {
  recordLabel: string;
  records: ArchivedRecord[];
  renderActions: (record: ArchivedRecord) => ReactNode;
};

const headerCell = "px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-500";

export function ArchivedRecordsTable({ recordLabel, records, renderActions }: ArchivedRecordsTableProps) {
  const now = new Date();

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
      <table className="hidden w-full md:table">
        <thead className="border-b border-ink-200 bg-ink-50">
          <tr>
            <th scope="col" className={headerCell}>{recordLabel}</th>
            <th scope="col" className={headerCell}>Archived</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-200">
          {records.map((record) => (
            <tr key={record.id}>
              <td className="max-w-80 px-4 py-3.5">
                <p className="truncate text-[14px] font-semibold text-ink-900">{record.name}</p>
                <p className="truncate text-[13px] text-ink-500">{record.detail ?? "—"}</p>
              </td>
              <td className="px-4 py-3.5 text-[13px] text-ink-500">
                <time dateTime={record.archivedAt.toISOString()}>{formatRelativeTime(record.archivedAt, now)}</time>
              </td>
              <td className="py-3.5 pr-4">{renderActions(record)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-ink-200 md:hidden">
        {records.map((record) => (
          <li key={record.id} className="space-y-3 px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-ink-900">{record.name}</p>
                <p className="truncate text-[13px] text-ink-500">{record.detail ?? "—"}</p>
              </div>
              <time dateTime={record.archivedAt.toISOString()} className="shrink-0 text-[13px] text-ink-500">
                {formatRelativeTime(record.archivedAt, now)}
              </time>
            </div>
            {renderActions(record)}
          </li>
        ))}
      </ul>
    </div>
  );
}
