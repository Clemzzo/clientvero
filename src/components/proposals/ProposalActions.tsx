"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Eye, Link2, Pencil, Send, Undo2 } from "lucide-react";

import { ShareProposalDialog } from "@/components/proposals/ShareProposalDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useNotice } from "@/components/shared/notice-provider";
import { Button } from "@/components/ui/button";
import type { ProposalStatus } from "@/db/schema";
import { canSend, canWithdraw, isEditable } from "@/features/proposals/proposal-status";
import { sendProposalAction, withdrawProposalAction } from "@/server/actions/proposals";

type ProposalActionsProps = {
  proposalId: string;
  status: ProposalStatus;
  publicUrl: string;
  canManage: boolean;
  canSendProposals: boolean;
};

export function ProposalActions({ proposalId, status, publicUrl, canManage, canSendProposals }: ProposalActionsProps) {
  const [dialog, setDialog] = useState<"send" | "withdraw" | "share" | null>(null);
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();
  const basePath = `/dashboard/proposals/${proposalId}`;

  function send() {
    startTransition(async () => {
      const result = await sendProposalAction(proposalId);

      if (result.error) {
        setDialog(null);
        showNotice("error", result.error);
        return;
      }

      showNotice("success", "Proposal sent. Share the link with your client.");
      setDialog("share");
    });
  }

  function withdraw() {
    startTransition(async () => {
      const result = await withdrawProposalAction(proposalId);
      setDialog(null);
      showNotice(result.error ? "error" : "success", result.error ?? "Proposal withdrawn. You can edit and send it again.");
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline" className="h-10 rounded-lg">
        <Link href={`${basePath}/preview`}>
          <Eye aria-hidden className="size-4" />
          Preview
        </Link>
      </Button>

      {canManage && isEditable(status) && (
        <Button asChild variant="outline" className="h-10 rounded-lg">
          <Link href={`${basePath}/edit`}>
            <Pencil aria-hidden className="size-4" />
            Edit
          </Link>
        </Button>
      )}

      {canSendProposals && canWithdraw(status) && (
        <>
          <Button variant="outline" className="h-10 rounded-lg" onClick={() => setDialog("withdraw")}>
            <Undo2 aria-hidden className="size-4" />
            Withdraw
          </Button>
          <Button className="h-10 rounded-lg" onClick={() => setDialog("share")}>
            <Link2 aria-hidden className="size-4" />
            Share link
          </Button>
        </>
      )}

      {canSendProposals && canSend(status) && (
        <Button className="h-10 rounded-lg" onClick={() => setDialog("send")}>
          <Send aria-hidden className="size-4" />
          {status === "WITHDRAWN" ? "Send again" : "Send"}
        </Button>
      )}

      <ConfirmDialog
        open={dialog === "send"}
        onOpenChange={(open) => setDialog(open ? "send" : null)}
        title="Send this proposal?"
        description="It will be locked for editing, and your client will be able to view and accept it with the link."
        confirmLabel="Send proposal"
        pendingLabel="Sending…"
        pending={isPending}
        onConfirm={send}
      />
      <ConfirmDialog
        open={dialog === "withdraw"}
        onOpenChange={(open) => setDialog(open ? "withdraw" : null)}
        title="Withdraw this proposal?"
        description="The link will stop working for your client. You can edit it and send it again."
        confirmLabel="Withdraw"
        pendingLabel="Withdrawing…"
        tone="destructive"
        pending={isPending}
        onConfirm={withdraw}
      />
      <ShareProposalDialog
        open={dialog === "share"}
        onOpenChange={(open) => setDialog(open ? "share" : null)}
        publicUrl={publicUrl}
      />
    </div>
  );
}
