"use client";

import { useState, useTransition } from "react";
import { PowerOff } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useNotice } from "@/components/shared/notice-provider";
import { Button } from "@/components/ui/button";
import { disableClientPortalAction } from "@/server/actions/portal-access";

export function DisablePortalButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const showNotice = useNotice();

  function disable() {
    startTransition(async () => {
      const result = await disableClientPortalAction(clientId);
      setOpen(false);
      showNotice(result.error ? "error" : "success", result.error ?? `The portal is off for ${clientName}.`);
    });
  }

  return (
    <>
      <Button variant="outline" className="h-10 rounded-lg" onClick={() => setOpen(true)}>
        <PowerOff aria-hidden className="size-4" />
        Turn off portal
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Turn off the portal for ${clientName}?`}
        description="This client is signed out and can't sign in. Inviting this client again turns the portal back on."
        confirmLabel="Turn off portal"
        pendingLabel="Turning off…"
        tone="destructive"
        pending={isPending}
        onConfirm={disable}
      />
    </>
  );
}
