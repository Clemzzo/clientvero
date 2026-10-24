"use client";

import { useState, useTransition } from "react";
import { Ellipsis, ShieldCheck, UserMinus, UserRound } from "lucide-react";

import type { TeamMemberView } from "@/components/settings/team-types";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useNotice } from "@/components/shared/notice-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { roleLabels } from "@/features/settings/team-roles";
import { changeMemberRoleAction, removeMemberAction } from "@/server/actions/team";

export function MemberRowMenu({ member }: { member: TeamMemberView }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();
  const nextRole = member.role === "ADMIN" ? "MEMBER" : "ADMIN";

  function changeRole() {
    startTransition(async () => {
      const result = await changeMemberRoleAction(member.id, nextRole);
      showNotice(result.error ? "error" : "success", result.error ?? `${member.name} is now ${nextRole === "ADMIN" ? "an admin" : "a member"}.`);
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await removeMemberAction(member.id);
      setConfirming(false);
      showNotice(result.error ? "error" : "success", result.error ?? `${member.name} was removed from the workspace.`);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Actions for ${member.name}`}
          disabled={isPending}
          className="grid size-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:opacity-50 data-[state=open]:bg-ink-100"
        >
          <Ellipsis aria-hidden className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-52">
          <DropdownMenuLabel className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-500">Role</DropdownMenuLabel>
          <DropdownMenuItem onSelect={changeRole}>
            {nextRole === "ADMIN" ? <ShieldCheck aria-hidden /> : <UserRound aria-hidden />}
            Make {roleLabels[nextRole].toLowerCase()}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem tone="destructive" onSelect={() => setConfirming(true)}>
            <UserMinus aria-hidden />
            Remove from workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Remove ${member.name}?`}
        description="They lose access straight away. Everything they created stays in the workspace, and you can invite them again later."
        confirmLabel="Remove"
        pendingLabel="Removing…"
        tone="destructive"
        pending={isPending}
        onConfirm={remove}
      />
    </>
  );
}
