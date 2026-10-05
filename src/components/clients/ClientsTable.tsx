import Link from "next/link";

import { PortalAccessMenu } from "@/components/clients/PortalAccessMenu";
import { RowDeleteMenu } from "@/components/shared/RowDeleteMenu";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { portalStatusLabels, portalStatusTones } from "@/features/portal/portal-status";
import { formatRelativeTime } from "@/lib/utils/format";
import { deleteClientAction } from "@/server/actions/clients";
import type { ClientListRow } from "@/server/repositories/client.repository";

type ClientsTableProps = {
  clients: ClientListRow[];
  canManagePortal: boolean;
  canDelete: boolean;
};

const headerCell = "px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-500";

function PortalStatus({ client }: { client: ClientListRow }) {
  return client.portalStatus ? (
    <StatusBadge label={portalStatusLabels[client.portalStatus]} tone={portalStatusTones[client.portalStatus]} />
  ) : (
    <span className="text-[13px] text-ink-500">No access</span>
  );
}

function ClientActions({ client, canManagePortal, canDelete }: { client: ClientListRow } & Omit<ClientsTableProps, "clients">) {
  const account = client.portalAccountId && client.portalStatus ? { id: client.portalAccountId, status: client.portalStatus } : null;

  return (
    <div className="flex justify-end gap-1">
      {canManagePortal && <PortalAccessMenu client={client} account={account} />}
      {canDelete && (
        <RowDeleteMenu
          name={client.name}
          archiveDescription="This client will be hidden from your workspace. Their history is kept."
          permanentDescription="This client and their activity history will be erased from the database. This can't be undone. Clients with proposals or projects can only be archived."
          onDelete={deleteClientAction.bind(null, client.id)}
        />
      )}
    </div>
  );
}

export function ClientsTable({ clients, canManagePortal, canDelete }: ClientsTableProps) {
  const now = new Date();
  const hasActions = canManagePortal || canDelete;

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
      <table className="hidden w-full md:table">
        <thead className="border-b border-ink-200 bg-ink-50">
          <tr>
            <th scope="col" className={headerCell}>Client</th>
            <th scope="col" className={headerCell}>Email</th>
            <th scope="col" className={headerCell}>Phone</th>
            <th scope="col" className={headerCell}>Portal</th>
            <th scope="col" className={`${headerCell} text-right`}>Added</th>
            {hasActions && (
              <th scope="col" className="w-24">
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
              <td className="px-4 py-3.5">
                <PortalStatus client={client} />
              </td>
              <td className="px-4 py-3.5 text-right text-[13px] text-ink-500">
                <time dateTime={client.createdAt.toISOString()}>{formatRelativeTime(client.createdAt, now)}</time>
              </td>
              {hasActions && (
                <td className="py-3.5 pr-3">
                  <ClientActions client={client} canManagePortal={canManagePortal} canDelete={canDelete} />
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
              <div className="mt-2 flex items-center justify-between gap-3 text-[13px] text-ink-500">
                <PortalStatus client={client} />
                <time dateTime={client.createdAt.toISOString()}>{formatRelativeTime(client.createdAt, now)}</time>
              </div>
            </Link>
            {hasActions && (
              <div className="py-3 pr-2">
                <ClientActions client={client} canManagePortal={canManagePortal} canDelete={canDelete} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
