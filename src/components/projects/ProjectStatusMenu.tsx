"use client";

import { useTransition } from "react";
import { ArrowRightLeft, Check, ChevronDown } from "lucide-react";

import { useNotice } from "@/components/shared/notice-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectStatus } from "@/db/schema";
import { projectStatusLabels, projectStatuses } from "@/features/projects/project-status";
import { cn } from "@/lib/utils";
import { changeProjectStatusAction } from "@/server/actions/projects";

type ProjectStatusMenuProps = {
  projectId: string;
  projectName: string;
  status: ProjectStatus;
};

export function ProjectStatusMenu({ projectId, projectName, status }: ProjectStatusMenuProps) {
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();

  function changeStatus(nextStatus: ProjectStatus) {
    startTransition(async () => {
      const result = await changeProjectStatusAction(projectId, nextStatus);
      showNotice(
        result.error ? "error" : "success",
        result.error ?? `${projectName} moved to ${projectStatusLabels[nextStatus]}.`,
      );
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        aria-label={`Change status of ${projectName}`}
        className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3.5 text-[14px] font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:opacity-60 data-[state=open]:bg-ink-100"
      >
        <ArrowRightLeft aria-hidden className="size-4" />
        {isPending ? "Moving…" : "Change status"}
        <ChevronDown aria-hidden className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-48">
        <DropdownMenuLabel className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-500">
          Move to
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projectStatuses.map((option) => (
          <DropdownMenuItem key={option} disabled={option === status} onSelect={() => changeStatus(option)}>
            <Check aria-hidden className={cn(option !== status && "invisible")} />
            {projectStatusLabels[option]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
