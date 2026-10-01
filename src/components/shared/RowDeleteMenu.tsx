"use client";

import { useState, useTransition } from "react";
import { Ellipsis, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useNotice } from "@/components/shared/notice-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type RowDeleteMenuProps = {
  name: string;
  description: string;
  onDelete: () => Promise<{ error?: string }>;
};

export function RowDeleteMenu({ name, description, onDelete }: RowDeleteMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();

  function remove() {
    startTransition(async () => {
      const result = await onDelete();
      setConfirmOpen(false);
      showNotice(result.error ? "error" : "success", result.error ?? `${name} was deleted.`);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Actions for ${name}`}
          className="grid size-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 data-[state=open]:bg-ink-100"
        >
          <Ellipsis aria-hidden className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-40">
          <DropdownMenuItem tone="destructive" onSelect={() => setConfirmOpen(true)}>
            <Trash2 aria-hidden />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete ${name}?`}
        description={description}
        confirmLabel="Delete"
        pendingLabel="Deleting…"
        tone="destructive"
        pending={isPending}
        onConfirm={remove}
      />
    </>
  );
}
