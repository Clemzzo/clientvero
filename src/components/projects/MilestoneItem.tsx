"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Check, ChevronDown, Pencil, Trash2 } from "lucide-react";

import { MilestoneDialog } from "@/components/projects/MilestoneDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useNotice } from "@/components/shared/notice-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Milestone, MilestoneStatus } from "@/db/schema";
import { milestoneStatusLabels, milestoneStatuses, milestoneStatusTones } from "@/features/projects/milestone-status";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";
import {
  changeMilestoneStatusAction,
  deleteMilestoneAction,
  moveMilestoneAction,
} from "@/server/actions/projects";

type MilestoneItemProps = {
  projectId: string;
  milestone: Milestone;
  canEdit: boolean;
  isFirst: boolean;
  isLast: boolean;
};

const iconButton =
  "grid size-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:pointer-events-none disabled:opacity-40";

export function MilestoneItem({ projectId, milestone, canEdit, isFirst, isLast }: MilestoneItemProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();
  const ids = { projectId, milestoneId: milestone.id };

  function run(action: () => Promise<{ error?: string }>, success?: string) {
    startTransition(async () => {
      const result = await action();
      setConfirmOpen(false);
      if (result.error) showNotice("error", result.error);
      else if (success) showNotice("success", success);
    });
  }

  function changeStatus(status: MilestoneStatus) {
    run(() => changeMilestoneStatusAction(ids, status), `${milestone.name} marked ${milestoneStatusLabels[status].toLowerCase()}.`);
  }

  const badge = <StatusBadge label={milestoneStatusLabels[milestone.status]} tone={milestoneStatusTones[milestone.status]} />;

  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[14px] font-semibold text-ink-900",
            milestone.status === "COMPLETED" && "text-ink-500 line-through",
          )}
        >
          {milestone.name}
        </p>
        {milestone.description && <p className="mt-0.5 whitespace-pre-line text-[13px] text-ink-500">{milestone.description}</p>}
        <p className="mt-1 text-[13px] text-ink-500">
          {milestone.dueDate ? `Due ${formatDate(milestone.dueDate)}` : "No due date"}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {canEdit ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={isPending}
              aria-label={`Change status of ${milestone.name}`}
              className="mr-1 inline-flex items-center gap-1 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
            >
              {badge}
              <ChevronDown aria-hidden className="size-3.5 text-ink-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-44">
              {milestoneStatuses.map((option) => (
                <DropdownMenuItem key={option} disabled={option === milestone.status} onSelect={() => changeStatus(option)}>
                  <Check aria-hidden className={cn(option !== milestone.status && "invisible")} />
                  {milestoneStatusLabels[option]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          badge
        )}

        {canEdit && (
          <>
            <button
              type="button"
              aria-label={`Move ${milestone.name} up`}
              disabled={isFirst || isPending}
              onClick={() => run(() => moveMilestoneAction(ids, "up"))}
              className={iconButton}
            >
              <ArrowUp aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              aria-label={`Move ${milestone.name} down`}
              disabled={isLast || isPending}
              onClick={() => run(() => moveMilestoneAction(ids, "down"))}
              className={iconButton}
            >
              <ArrowDown aria-hidden className="size-4" />
            </button>
            <MilestoneDialog
              projectId={projectId}
              milestone={milestone}
              trigger={
                <button type="button" aria-label={`Edit ${milestone.name}`} disabled={isPending} className={iconButton}>
                  <Pencil aria-hidden className="size-4" />
                </button>
              }
            />
            <button
              type="button"
              aria-label={`Remove ${milestone.name}`}
              disabled={isPending}
              onClick={() => setConfirmOpen(true)}
              className={cn(iconButton, "hover:bg-red-50 hover:text-destructive")}
            >
              <Trash2 aria-hidden className="size-4" />
            </button>
            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title={`Remove ${milestone.name}?`}
              description="It will be removed from this project. This can't be undone."
              confirmLabel="Remove milestone"
              pendingLabel="Removing…"
              tone="destructive"
              pending={isPending}
              onConfirm={() => run(() => deleteMilestoneAction(ids), `${milestone.name} was removed.`)}
            />
          </>
        )}
      </div>
    </li>
  );
}
