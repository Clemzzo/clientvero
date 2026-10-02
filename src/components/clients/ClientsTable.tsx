import Link from "next/link";

import { RowDeleteMenu } from "@/components/shared/RowDeleteMenu";
import { formatRelativeTime } from "@/lib/utils/format";
import { deleteClientAction } from "@/server/actions/clients";
import type { ClientListRow } from "@/server/repositories/client.repository";

type ClientsTableProps = {
  clients: ClientListRow[];
  canDelete: boolean;
};

const headerCell = "px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-500";

function contactLabel(count: number) {
  return count === 1 ? "1 contact" : `${count} contacts`;
}

function ClientDeleteMenu({ client }: { client: ClientListRow }) {
  return (
    <RowDeleteMenu
      name={client.name}
      archiveDescription="This client and their contacts will be hidden from your workspace. Their history is kept."
      permanentDescription="This client, their contacts, and their activity history will be erased from the database. This can't be undone. Clients with proposals can only be archived."
      onDelete={deleteClientAction.bind(null, client.id)}
    />
  );
}

export function ClientsTable({ clients, canDelete }: ClientsTableProps) {
  const now = new Date();

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
      <table className="hidden w-full md:table">
        <thead className="border-b border-ink-200 bg-ink-50">
          <tr>
            <th scope="col" className={headerCell}>Client</th>
            <th scope="col" className={headerCell}>Email</th>
            <th scope="col" className={headerCell}>Phone</th>
            <th scope="col" className={`${headerCell} text-right`}>Contacts</th>
            <th scope="col" className={`${headerCell} text-right`}>Added</th>
            {canDelete && (
              <th scope="col" className="w-14">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-200">
          {clients.map((client) => (
            <tr key={client.id} className="transition-colors hover:bg-ink-50">
              <td className="max-w-72 px-4 py-3.5">
                <Link
                  href={`/dashboard/clients/${client.id}`}
                  className="block truncate text-[14px] font-semibold text-ink-900 hover:text-brand-700"
                >
                  {client.name}
                </Link>
                {client.company && <p className="truncate text-[13px] text-ink-500">{client.company}</p>}
              </td>
              <td className="max-w-60 truncate px-4 py-3.5 text-[14px] text-ink-700">{client.email ?? "—"}</td>
              <td className="px-4 py-3.5 text-[14px] text-ink-700">{client.phone ?? "—"}</td>
              <td className="px-4 py-3.5 text-right text-[14px] text-ink-700 tabular-nums">{client.contactCount}</td>
              <td className="px-4 py-3.5 text-right text-[13px] text-ink-500">
                <time dateTime={client.createdAt.toISOString()}>{formatRelativeTime(client.createdAt, now)}</time>
              </td>
              {canDelete && (
                <td className="py-3.5 pr-3 text-right">
                  <ClientDeleteMenu client={client} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-ink-200 md:hidden">
        {clients.map((client) => (
          <li key={client.id} className="flex items-start gap-1 hover:bg-ink-50">
            <Link href={`/dashboard/clients/${client.id}`} className="block min-w-0 flex-1 px-4 py-3.5">
              <p className="truncate text-[14px] font-semibold text-ink-900">{client.name}</p>
              <p className="truncate text-[13px] text-ink-500">{client.company ?? client.email ?? "—"}</p>
              <p className="mt-2 flex justify-between text-[13px] text-ink-500">
                <span>{contactLabel(client.contactCount)}</span>
                <time dateTime={client.createdAt.toISOString()}>{formatRelativeTime(client.createdAt, now)}</time>
              </p>
            </Link>
            {canDelete && (
              <div className="py-3 pr-2">
                <ClientDeleteMenu client={client} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
