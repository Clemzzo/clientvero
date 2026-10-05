"use client";

import { useState, useTransition } from "react";
import { Eraser } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useNotice } from "@/components/shared/notice-provider";
import { Button } from "@/components/ui/button";
import { clearActivityAction } from "@/server/actions/activity";

export function ClearActivityButton() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();

  function clear() {
    startTransition(async () => {
      const result = await clearActivityAction();
      setOpen(false);

      if (result.error) {
        showNotice("error", result.error);
        return;
      }

      const removed = result.removed ?? 0;
      showNotice("success", removed === 0 ? "There was nothing to clear." : `Cleared ${removed} activity ${removed === 1 ? "entry" : "entries"}.`);
    });
  }

  return (
    <>
      <Button variant="outline" className="rounded-lg" onClick={() => setOpen(true)}>
        <Eraser aria-hidden className="size-4" />
        Clear all
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Clear all activity?"
        description="This removes every activity entry across your workspace, not just the current tab. One note recording who cleared it and how many entries stays in the log. This can't be undone."
        confirmLabel="Clear all activity"
        pendingLabel="Clearing…"
        tone="destructive"
        pending={isPending}
        onConfirm={clear}
      />
    </>
  );
}
