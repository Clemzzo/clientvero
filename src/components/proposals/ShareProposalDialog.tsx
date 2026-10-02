"use client";

import { ExternalLink } from "lucide-react";

import { CopyField } from "@/components/shared/CopyField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type ShareProposalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publicUrl: string;
};

export function ShareProposalDialog({ open, onOpenChange, publicUrl }: ShareProposalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Share your proposal</DialogTitle>
        <DialogDescription>
          Send this link to your client. They can read the proposal and accept or decline it. No account needed.
        </DialogDescription>

        <div className="mt-5 space-y-4">
          <CopyField label="Proposal link" value={publicUrl} />
          <Button asChild variant="outline" className="h-10 w-full rounded-lg">
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden className="size-4" />
              Open client view
            </a>
          </Button>
          <p className="text-[12.5px] text-ink-500">Emailing proposals from ClientVero is coming soon.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
