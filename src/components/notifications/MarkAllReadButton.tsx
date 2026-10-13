"use client";

import { useTransition } from "react";
import { CheckCheck } from "lucide-react";

import { useNotice } from "@/components/shared/notice-provider";
import { Button } from "@/components/ui/button";
import { markAllNotificationsReadAction } from "@/server/actions/notifications";

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();

  function markAll() {
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();

      if (result.error) {
        showNotice("error", result.error);
      }
    });
  }

  return (
    <Button variant="outline" className="rounded-lg" onClick={markAll} disabled={isPending}>
      <CheckCheck aria-hidden className="size-4" />
      {isPending ? "Marking…" : "Mark all as read"}
    </Button>
  );
}
