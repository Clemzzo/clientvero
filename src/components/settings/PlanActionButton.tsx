"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useNotice } from "@/components/shared/notice-provider";
import { Button } from "@/components/ui/button";
import { changePlanAction, startCheckoutAction } from "@/server/actions/billing";

type PlanActionButtonProps = {
  mode: "upgrade" | "switch";
  planId: string;
  planName: string;
  price: string;
  recommended?: boolean;
};

export function PlanActionButton({ mode, planId, planName, price, recommended = false }: PlanActionButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();

  function upgrade() {
    startTransition(async () => {
      const result = await startCheckoutAction(planId);
      if ("error" in result) {
        showNotice("error", result.error);
        return;
      }
      window.location.assign(result.url);
    });
  }

  function switchPlan() {
    startTransition(async () => {
      const result = await changePlanAction(planId);
      setConfirming(false);
      if (result.error) {
        showNotice("error", result.error);
        return;
      }
      showNotice("success", `Switching to ${planName}. Your plan updates as soon as Bachs confirms it.`);
    });
  }

  return (
    <>
      <Button
        type="button"
        variant={recommended ? "default" : "outline"}
        className="mt-6 h-10 w-full rounded-lg"
        disabled={isPending}
        onClick={mode === "upgrade" ? upgrade : () => setConfirming(true)}
      >
        {isPending && mode === "upgrade" && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
        {mode === "upgrade" ? (isPending ? "Opening checkout…" : `Upgrade to ${planName}`) : `Switch to ${planName}`}
      </Button>

      {mode === "switch" && (
        <ConfirmDialog
          open={confirming}
          onOpenChange={setConfirming}
          title={`Switch to ${planName}?`}
          description={`Your plan changes straight away to ${price}/month. The difference for the rest of this billing period is charged or credited now.`}
          confirmLabel={`Switch to ${planName}`}
          pendingLabel="Switching…"
          pending={isPending}
          onConfirm={switchPlan}
        />
      )}
    </>
  );
}
