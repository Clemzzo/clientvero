"use client";

import { useState, useTransition } from "react";
import { LogOut } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useNotice } from "@/components/shared/notice-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { leaveWorkspaceAction } from "@/server/actions/team";

export function LeaveWorkspaceCard({ workspaceName }: { workspaceName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();

  function leave() {
    startTransition(async () => {
      const result = await leaveWorkspaceAction();
      if (result?.error) {
        setConfirming(false);
        showNotice("error", result.error);
      }
    });
  }

  return (
    <Card className="flex flex-col gap-4 border-red-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <h3 className="text-[15px] font-semibold text-ink-900">Leave workspace</h3>
        <p className="mt-1 text-[13px] text-ink-500">You&apos;ll lose access to {workspaceName}. Your work stays with the team.</p>
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-10 shrink-0 rounded-lg border-red-200 text-destructive hover:border-red-300 hover:bg-red-50"
        onClick={() => setConfirming(true)}
      >
        <LogOut aria-hidden className="size-4" />
        Leave workspace
      </Button>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Leave ${workspaceName}?`}
        description="You'll be signed out of this workspace straight away. An owner or admin can invite you back."
        confirmLabel="Leave workspace"
        pendingLabel="Leaving…"
        tone="destructive"
        pending={isPending}
        onConfirm={leave}
      />
    </Card>
  );
}
