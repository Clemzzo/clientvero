"use client";

import { useState, useTransition } from "react";
import { Archive, Ellipsis, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useNotice } from "@/components/shared/notice-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DeletionMode } from "@/validators/fields";

type RowDeleteMenuProps = {
  name: string;
  archiveDescription: string;
  permanentDescription: string;
  onDelete: (mode: DeletionMode) => Promise<{ error?: string }>;
};

const confirmCopy = {
  archive: {
    title: "Archive",
    confirmLabel: "Archive",
    pendingLabel: "Archiving…",
    done: "was archived. You can restore it from Archived.",
  },
  permanent: {
    title: "Permanently delete",
    confirmLabel: "Delete permanently",
    pendingLabel: "Deleting…",
    done: "was permanently deleted.",
  },
} satisfies Record<DeletionMode, Record<string, string>>;

export function RowDeleteMenu({ name, archiveDescription, permanentDescription, onDelete }: RowDeleteMenuProps) {
  const [mode, setMode] = useState<DeletionMode | null>(null);
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();
  const copy = confirmCopy[mode ?? "archive"];

  function remove() {
    if (!mode) return;

    startTransition(async () => {
      const result = await onDelete(mode);
      setMode(null);
      showNotice(result.error ? "error" : "success", result.error ?? `${name} ${copy.done}`);
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
        <DropdownMenuContent className="min-w-44">
          <DropdownMenuItem onSelect={() => setMode("archive")}>
            <Archive aria-hidden />
            Archive
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem tone="destructive" onSelect={() => setMode("permanent")}>
            <Trash2 aria-hidden />
            Delete permanently
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={mode !== null}
        onOpenChange={(open) => !open && setMode(null)}
        title={`${copy.title} ${name}?`}
        description={mode === "permanent" ? permanentDescription : archiveDescription}
        confirmLabel={copy.confirmLabel}
        pendingLabel={copy.pendingLabel}
        tone={mode === "permanent" ? "destructive" : "default"}
        pending={isPending}
        onConfirm={remove}
      />
    </>
  );
}
