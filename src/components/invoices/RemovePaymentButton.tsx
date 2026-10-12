"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useNotice } from "@/components/shared/notice-provider";
import { removePaymentAction } from "@/server/actions/invoices";

type RemovePaymentButtonProps = {
  paymentId: string;
  label: string;
};

export function RemovePaymentButton({ paymentId, label }: RemovePaymentButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();

  function remove() {
    startTransition(async () => {
      const result = await removePaymentAction(paymentId);
      setOpen(false);
      showNotice(result.error ? "error" : "success", result.error ?? "Payment removed. The balance was updated.");
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label={`Remove ${label}`}
        onClick={() => setOpen(true)}
        className="grid size-7 place-items-center rounded-md text-ink-500 transition-colors hover:bg-coral-50 hover:text-coral-700 focus-visible:outline-2 focus-visible:outline-brand-600"
      >
        <X aria-hidden className="size-3.5" />
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Remove this payment?"
        description={`Use this to correct a mistake. ${label} will be taken off the invoice and the balance recalculated. The removal is kept in the activity log.`}
        confirmLabel="Remove payment"
        pendingLabel="Removing…"
        tone="destructive"
        pending={isPending}
        onConfirm={remove}
      />
    </>
  );
}
