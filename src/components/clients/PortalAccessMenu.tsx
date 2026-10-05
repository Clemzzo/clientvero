"use client";

import { useState, useTransition } from "react";
import { Ban, KeyRound, Link2, MonitorSmartphone } from "lucide-react";

import { PortalLinkDialog } from "@/components/clients/PortalLinkDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useNotice } from "@/components/shared/notice-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Client, PortalAccountStatus } from "@/db/schema";
import {
  invitePortalClientAction,
  issuePortalLinkAction,
  revokePortalAccessAction,
} from "@/server/actions/portal-access";

type PortalAccessMenuProps = {
  client: Pick<Client, "id" | "name" | "email">;
  account: { id: string; status: PortalAccountStatus } | null;
};

export function PortalAccessMenu({ client, account }: PortalAccessMenuProps) {
  const [link, setLink] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();
  const canInvite = !account || account.status === "REVOKED";

  function createLink(action: () => Promise<{ error?: string; url?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.url) setLink(result.url);
      else showNotice("error", result.error ?? "We couldn't create a link. Please try again.");
    });
  }

  function revoke() {
    if (!account) return;

    startTransition(async () => {
      const result = await revokePortalAccessAction(account.id);
      setConfirmRevoke(false);
      showNotice(result.error ? "error" : "success", result.error ?? `${client.name} can no longer use the portal.`);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isPending}
          aria-label={`Portal access for ${client.name}`}
          className="grid size-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:opacity-60 data-[state=open]:bg-ink-100"
        >
          <MonitorSmartphone aria-hidden className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-56">
          {canInvite ? (
            <DropdownMenuItem
              disabled={!client.email}
              onSelect={() => createLink(() => invitePortalClientAction(client.id))}
            >
              <Link2 aria-hidden />
              {client.email ? "Invite to portal" : "Add an email to invite"}
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem onSelect={() => createLink(() => issuePortalLinkAction(account.id))}>
                {account.status === "ACTIVE" ? <KeyRound aria-hidden /> : <Link2 aria-hidden />}
                {account.status === "ACTIVE" ? "Create password reset link" : "Create new invite link"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem tone="destructive" onSelect={() => setConfirmRevoke(true)}>
                <Ban aria-hidden />
                Revoke portal access
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <PortalLinkDialog clientName={client.name} url={link} onOpenChange={(open) => !open && setLink(null)} />
      <ConfirmDialog
        open={confirmRevoke}
        onOpenChange={setConfirmRevoke}
        title={`Revoke ${client.name}'s portal access?`}
        description="They'll be signed out straight away and their links will stop working. You can invite them again later."
        confirmLabel="Revoke access"
        pendingLabel="Revoking…"
        tone="destructive"
        pending={isPending}
        onConfirm={revoke}
      />
    </>
  );
}
