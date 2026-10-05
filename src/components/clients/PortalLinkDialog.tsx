"use client";

import { CopyField } from "@/components/shared/CopyField";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type PortalLinkDialogProps = {
  clientName: string;
  url: string | null;
  onOpenChange: (open: boolean) => void;
};

export function PortalLinkDialog({ clientName, url, onOpenChange }: PortalLinkDialogProps) {
  return (
    <Dialog open={url !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Portal link for {clientName}</DialogTitle>
        <DialogDescription>
          Send this link to {clientName}. They&apos;ll choose a password and see their projects in your client portal.
        </DialogDescription>

        {url && (
          <div className="mt-5 space-y-3">
            <CopyField label="Portal link" value={url} />
            <p className="text-[12.5px] text-ink-500">
              Expires in 7 days and works once. Any earlier link for this client no longer works.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
