"use client";

import { CopyField } from "@/components/shared/CopyField";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type PortalLinkDialogProps = {
  clientName: string;
  url: string | null;
  /** The link was created earlier and is being shown again, so earlier links weren't replaced. */
  recopied?: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PortalLinkDialog({ clientName, url, recopied = false, onOpenChange }: PortalLinkDialogProps) {
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
              {recopied
                ? "This is the link you created earlier. It still works once, until it expires."
                : "Expires in 7 days and works once. Any earlier link for this client no longer works."}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
