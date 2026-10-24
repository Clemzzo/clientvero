"use client";

import { useState, useTransition } from "react";
import { Link2, X } from "lucide-react";

import type { InvitationView } from "@/components/settings/team-types";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CopyField } from "@/components/shared/CopyField";
import { useNotice } from "@/components/shared/notice-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { copyInvitationLinkAction, revokeInvitationAction } from "@/server/actions/team";

export function InvitationRowActions({ invitation }: { invitation: InvitationView }) {
  const [link, setLink] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();

  function showLink() {
    startTransition(async () => {
      const result = await copyInvitationLinkAction(invitation.id);
      if ("error" in result) {
        showNotice("error", result.error);
        return;
      }
      setLink(result.link);
    });
  }

  function revoke() {
    startTransition(async () => {
      const result = await revokeInvitationAction(invitation.id);
      setConfirming(false);
      showNotice(result.error ? "error" : "success", result.error ?? `The invitation for ${invitation.email} was cancelled.`);
    });
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      {!invitation.expired && (
        <Button type="button" variant="ghost" size="sm" className="rounded-lg" disabled={isPending} onClick={showLink}>
          <Link2 aria-hidden className="size-4" />
          <span className="hidden sm:inline">Copy link</span>
          <span className="sr-only sm:hidden">Copy invitation link for {invitation.email}</span>
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="rounded-lg text-destructive hover:bg-red-50 hover:text-destructive"
        disabled={isPending}
        onClick={() => setConfirming(true)}
      >
        <X aria-hidden className="size-4" />
        <span className="hidden sm:inline">{invitation.expired ? "Remove" : "Revoke"}</span>
        <span className="sr-only sm:hidden">Cancel invitation for {invitation.email}</span>
      </Button>

      <Dialog open={link !== null} onOpenChange={(open) => !open && setLink(null)}>
        <DialogContent>
          <DialogTitle>Invitation link</DialogTitle>
          <DialogDescription>
            Send this link to <span className="font-medium text-ink-900">{invitation.email}</span>. It works once.
          </DialogDescription>
          <div className="mt-5">{link && <CopyField label="Invitation link" value={link} />}</div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Cancel this invitation?"
        description={`The link sent to ${invitation.email} will stop working. You can invite them again at any time.`}
        confirmLabel="Cancel invitation"
        pendingLabel="Cancelling…"
        tone="destructive"
        pending={isPending}
        onConfirm={revoke}
      />
    </div>
  );
}
