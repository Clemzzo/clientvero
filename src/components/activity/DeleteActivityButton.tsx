"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useNotice } from "@/components/shared/notice-provider";
import { deleteActivityEntryAction } from "@/server/actions/activity";

export function DeleteActivityButton({ entryId }: { entryId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();

  function remove() {
    startTransition(async () => {
      const result = await deleteActivityEntryAction(entryId);
      setOpen(false);
      showNotice(result.error ? "error" : "success", result.error ?? "Activity entry deleted.");
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label="Delete this activity entry"
        onClick={() => setOpen(true)}
        className="-my-1.5 grid size-8 shrink-0 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-coral-50 hover:text-coral-600"
      >
        <Trash2 aria-hidden className="size-4" />
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this activity entry?"
        description="It will be removed from the log. A note that an entry was removed, and by whom, stays in the log."
        confirmLabel="Delete entry"
        pendingLabel="Deleting…"
        tone="destructive"
        pending={isPending}
        onConfirm={remove}
      />
    </>
  );
}
