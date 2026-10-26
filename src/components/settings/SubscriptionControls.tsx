"use client";

import { useState, useTransition } from "react";
import { CreditCard } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useNotice } from "@/components/shared/notice-provider";
import { Button } from "@/components/ui/button";
import { cancelSubscriptionAction, openBillingPortalAction } from "@/server/actions/billing";

type SubscriptionControlsProps = {
  planName: string;
  periodEnd: string | null;
  canCancel: boolean;
  portalLabel?: string;
};

export function SubscriptionControls({ planName, periodEnd, canCancel, portalLabel = "Payment method & receipts" }: SubscriptionControlsProps) {
  const [confirming, setConfirming] = useState(false);
  const [isCancelling, startCancel] = useTransition();
  const [isOpening, startOpen] = useTransition();
  const showNotice = useNotice();

  function openPortal() {
    startOpen(async () => {
      const result = await openBillingPortalAction();
      if ("error" in result) {
        showNotice("error", result.error);
        return;
      }
      window.location.assign(result.url);
    });
  }

  function cancel() {
    startCancel(async () => {
      const result = await cancelSubscriptionAction();
      setConfirming(false);
      if (result.error) {
        showNotice("error", result.error);
        return;
      }
      showNotice("success", "Your plan is set to end. It updates here as soon as Bachs confirms it.");
    });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <Button type="button" variant="outline" className="h-10 rounded-lg" disabled={isOpening} onClick={openPortal}>
        <CreditCard aria-hidden className="size-4" />
        {isOpening ? "Opening…" : portalLabel}
      </Button>
      {canCancel && (
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-lg border-red-200 text-destructive hover:border-red-300 hover:bg-red-50"
          onClick={() => setConfirming(true)}
        >
          Cancel plan
        </Button>
      )}

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Cancel the ${planName} plan?`}
        description={
          periodEnd
            ? `You keep ${planName} until ${periodEnd}. After that the workspace moves to the Free plan and nothing is deleted.`
            : `You keep ${planName} until the end of this billing period. After that the workspace moves to the Free plan and nothing is deleted.`
        }
        confirmLabel="Cancel plan"
        pendingLabel="Cancelling…"
        tone="destructive"
        pending={isCancelling}
        onConfirm={cancel}
      />
    </div>
  );
}
