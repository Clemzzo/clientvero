"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Ban, Ellipsis, Eye, Link2, Pencil, Send, Trash2, Wallet } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useNotice } from "@/components/shared/notice-provider";
import { ShareLinkDialog } from "@/components/shared/ShareLinkDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { InvoiceStatus } from "@/db/schema";
import { canCancel, canDelete, canEdit, canRecordPayment, canSend } from "@/features/invoices/invoice-status";
import { cancelInvoiceAction, deleteInvoiceAction, sendInvoiceAction } from "@/server/actions/invoices";

import { RecordPaymentDialog } from "./RecordPaymentDialog";

type InvoiceActionsMenuProps = {
  invoice: {
    id: string;
    invoiceNumber: string;
    status: InvoiceStatus;
    currency: string;
    amountPaid: string;
    amountDue: string;
  };
  publicUrl: string;
  can: { manage: boolean; send: boolean; delete: boolean };
};

type DialogName = "send" | "share" | "payment" | "cancel" | "delete";

export function InvoiceActionsMenu({ invoice, publicUrl, can }: InvoiceActionsMenuProps) {
  const [dialog, setDialog] = useState<DialogName | null>(null);
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();
  const basePath = `/dashboard/invoices/${invoice.id}`;
  const dialogProps = (name: DialogName) => ({
    open: dialog === name,
    onOpenChange: (open: boolean) => setDialog(open ? name : null),
  });

  const showSend = can.send && canSend(invoice.status);
  const showPayment = can.send && canRecordPayment(invoice.status);
  const showEdit = can.manage && canEdit(invoice);
  const showCancel = can.send && canCancel(invoice);
  const showDelete = can.delete && canDelete(invoice.status);
  const isSent = invoice.status !== "DRAFT";

  function send() {
    startTransition(async () => {
      const result = await sendInvoiceAction(invoice.id);

      if (result.error) {
        setDialog(null);
        showNotice("error", result.error);
        return;
      }

      showNotice("success", `${invoice.invoiceNumber} sent. Share the link with your client.`);
      setDialog("share");
    });
  }

  function cancel() {
    startTransition(async () => {
      const result = await cancelInvoiceAction(invoice.id);
      setDialog(null);
      showNotice(result.error ? "error" : "success", result.error ?? `${invoice.invoiceNumber} was cancelled.`);
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteInvoiceAction(invoice.id);
      if (result?.error) {
        setDialog(null);
        showNotice("error", result.error);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {showSend && (
        <Button className="h-10 rounded-lg" onClick={() => setDialog("send")}>
          <Send aria-hidden className="size-4" />
          Send invoice
        </Button>
      )}
      {showPayment && (
        <Button className="h-10 rounded-lg" onClick={() => setDialog("payment")}>
          <Wallet aria-hidden className="size-4" />
          Record payment
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`More actions for ${invoice.invoiceNumber}`}
          className="grid size-10 place-items-center rounded-lg border border-ink-200 bg-white text-ink-700 transition-colors hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-brand-600 data-[state=open]:bg-ink-100"
        >
          <Ellipsis aria-hidden className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-52">
          {showEdit && (
            <DropdownMenuItem asChild>
              <Link href={`${basePath}/edit`}>
                <Pencil aria-hidden />
                Edit invoice
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href={`${basePath}/preview`}>
              <Eye aria-hidden />
              Preview as client
            </Link>
          </DropdownMenuItem>
          {isSent && (
            <DropdownMenuItem onSelect={() => setDialog("share")}>
              <Link2 aria-hidden />
              Share link
            </DropdownMenuItem>
          )}
          {(showCancel || showDelete) && <DropdownMenuSeparator />}
          {showCancel && (
            <DropdownMenuItem tone="destructive" onSelect={() => setDialog("cancel")}>
              <Ban aria-hidden />
              Cancel invoice
            </DropdownMenuItem>
          )}
          {showDelete && (
            <DropdownMenuItem tone="destructive" onSelect={() => setDialog("delete")}>
              <Trash2 aria-hidden />
              Delete draft
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        {...dialogProps("send")}
        title={`Send ${invoice.invoiceNumber}?`}
        description="You'll get a link to share with your client. You can still edit it until a payment is recorded."
        confirmLabel="Send invoice"
        pendingLabel="Sending…"
        pending={isPending}
        onConfirm={send}
      />
      <ConfirmDialog
        {...dialogProps("cancel")}
        title={`Cancel ${invoice.invoiceNumber}?`}
        description="Your client will see it as cancelled and it won't count as owed. This can't be undone."
        confirmLabel="Cancel invoice"
        pendingLabel="Cancelling…"
        tone="destructive"
        pending={isPending}
        onConfirm={cancel}
      />
      <ConfirmDialog
        {...dialogProps("delete")}
        title={`Delete ${invoice.invoiceNumber}?`}
        description="This draft was never sent, so it will be removed for good. Its number won't be reused."
        confirmLabel="Delete draft"
        pendingLabel="Deleting…"
        tone="destructive"
        pending={isPending}
        onConfirm={remove}
      />
      <ShareLinkDialog
        {...dialogProps("share")}
        publicUrl={publicUrl}
        title="Share your invoice"
        description="Send this link to your client. They can view and print the invoice. No account needed."
        linkLabel="Invoice link"
        footnote="Emailing invoices from ClientVero is coming soon."
      />
      {showPayment && (
        <RecordPaymentDialog
          {...dialogProps("payment")}
          invoiceId={invoice.id}
          invoiceNumber={invoice.invoiceNumber}
          currency={invoice.currency}
          amountDue={invoice.amountDue}
        />
      )}
    </div>
  );
}
