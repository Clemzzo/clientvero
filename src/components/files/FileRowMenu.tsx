"use client";

import { useState, useTransition } from "react";
import { Download, Ellipsis, Eye, EyeOff, Share2, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useNotice } from "@/components/shared/notice-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteFileAction, setFileSharedAction } from "@/server/actions/files";

type FileRowMenuProps = {
  fileId: string;
  name: string;
  isPublic: boolean;
  viewable: boolean;
};

export function FileRowMenu({ fileId, name, isPublic, viewable }: FileRowMenuProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();

  function toggleShared() {
    startTransition(async () => {
      const result = await setFileSharedAction(fileId, !isPublic);
      showNotice(
        result.error ? "error" : "success",
        result.error ?? (isPublic ? `${name} is no longer shared with the client.` : `${name} is now shared with the client.`),
      );
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteFileAction(fileId);
      setConfirmingDelete(false);
      showNotice(result.error ? "error" : "success", result.error ?? `${name} was permanently deleted.`);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Actions for ${name}`}
          disabled={isPending}
          className="grid size-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:opacity-50 data-[state=open]:bg-ink-100"
        >
          <Ellipsis aria-hidden className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-48">
          {viewable && (
            <DropdownMenuItem asChild>
              <a href={`/dashboard/files/${fileId}/view`} target="_blank" rel="noopener noreferrer">
                <Eye aria-hidden />
                View
              </a>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <a href={`/dashboard/files/${fileId}/download`}>
              <Download aria-hidden />
              Download
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={toggleShared}>
            {isPublic ? <EyeOff aria-hidden /> : <Share2 aria-hidden />}
            {isPublic ? "Stop sharing" : "Share with client"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem tone="destructive" onSelect={() => setConfirmingDelete(true)}>
            <Trash2 aria-hidden />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title={`Delete ${name}?`}
        description="The file will be permanently deleted from this project and the client portal. This can't be undone."
        confirmLabel="Delete permanently"
        pendingLabel="Deleting…"
        tone="destructive"
        pending={isPending}
        onConfirm={remove}
      />
    </>
  );
}
