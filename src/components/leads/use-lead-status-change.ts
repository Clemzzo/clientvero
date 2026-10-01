"use client";

import { useTransition } from "react";

import { useNotice } from "@/components/shared/notice-provider";
import type { Lead, LeadStatus } from "@/db/schema";
import { leadStatusLabels } from "@/features/leads/lead-status";
import { changeLeadStatusAction } from "@/server/actions/leads";

type ChangeStatusOptions = {
  optimisticUpdate?: () => void;
};

export function useLeadStatusChange() {
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();

  function changeStatus(lead: Pick<Lead, "id" | "name">, nextStatus: LeadStatus, options: ChangeStatusOptions = {}) {
    startTransition(async () => {
      options.optimisticUpdate?.();
      const result = await changeLeadStatusAction(lead.id, nextStatus);

      if (result.error) {
        showNotice("error", result.error);
      } else {
        showNotice("success", `${lead.name} moved to ${leadStatusLabels[nextStatus]}.`);
      }
    });
  }

  return { isPending, changeStatus };
}
