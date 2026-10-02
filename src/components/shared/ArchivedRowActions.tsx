"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, RotateCcw, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useNotice } from "@/components/shared/notice-provider";
import { Button } from "@/components/ui/button";

type ActionResult = Promise<{ error?: string }>;

type ArchivedRowActionsProps = {
  name: string;
  permanentDescription: string;
  onRestore: () => ActionResult;
  onDeletePermanently: () => ActionResult;
};

export function ArchivedRowActions({ name, permanentDescription, onRestore, onDeletePermanently }: ArchivedRowActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"restore" | "delete" | null>(null);
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();

  function run(action: "restore" | "delete", perform: () => ActionResult, success: string) {
    setPendingAction(action);
    startTransition(async () => {
      const result = await perform();
      setConfirmOpen(false);
      setPendingAction(null);
      showNotice(result.error ? "error" : "success", result.error ?? success);
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        className="rounded-lg"
        disabled={isPending}
        onClick={() => run("restore", onRestore, `${name} was restored.`)}
      >
        {pendingAction === "restore" ? (
          <LoaderCircle aria-hidden className="size-4 animate-spin" />
        ) : (
          <RotateCcw aria-hidden className="size-4" />
        )}
        Restore
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={isPending}
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 aria-hidden className="size-4" />
        Delete permanently
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Permanently delete ${name}?`}
        description={permanentDescription}
        confirmLabel="Delete permanently"
        pendingLabel="Deleting…"
        tone="destructive"
        pending={pendingAction === "delete"}
        onConfirm={() => run("delete", onDeletePermanently, `${name} was permanently deleted.`)}
      />
    </div>
  );
}
