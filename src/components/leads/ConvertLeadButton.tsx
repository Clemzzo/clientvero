"use client";

import { useState, useTransition } from "react";
import { UserCheck } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useNotice } from "@/components/shared/notice-provider";
import { Button } from "@/components/ui/button";
import { convertLeadAction } from "@/server/actions/leads";

type ConvertLeadButtonProps = {
  leadId: string;
  leadName: string;
};

export function ConvertLeadButton({ leadId, leadName }: ConvertLeadButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();

  function convert() {
    startTransition(async () => {
      const result = await convertLeadAction(leadId);

      if (result?.error) {
        setOpen(false);
        showNotice("error", result.error);
      }
    });
  }

  return (
    <>
      <Button className="h-10 rounded-lg" onClick={() => setOpen(true)}>
        <UserCheck aria-hidden className="size-4" />
        Convert to client
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Convert ${leadName} to a client?`}
        description="This creates a client with the lead's details and marks the lead as Won."
        confirmLabel="Convert to client"
        pendingLabel="Converting…"
        pending={isPending}
        onConfirm={convert}
      />
    </>
  );
}
