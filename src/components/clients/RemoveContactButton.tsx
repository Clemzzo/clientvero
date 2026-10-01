"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useNotice } from "@/components/shared/notice-provider";
import type { ClientContact } from "@/db/schema";
import { removeContactAction } from "@/server/actions/clients";

type RemoveContactButtonProps = {
  clientId: string;
  contact: Pick<ClientContact, "id" | "name">;
};

export function RemoveContactButton({ clientId, contact }: RemoveContactButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();

  function remove() {
    startTransition(async () => {
      const result = await removeContactAction({ clientId, contactId: contact.id });
      setOpen(false);
      showNotice(result.error ? "error" : "success", result.error ?? `${contact.name} was removed.`);
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label={`Remove ${contact.name}`}
        onClick={() => setOpen(true)}
        className="grid size-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-red-50 hover:text-destructive"
      >
        <Trash2 aria-hidden className="size-4" />
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Remove ${contact.name}?`}
        description="They'll be removed from this client's contacts. This can't be undone."
        confirmLabel="Remove contact"
        pendingLabel="Removing…"
        tone="destructive"
        pending={isPending}
        onConfirm={remove}
      />
    </>
  );
}
