"use client";

import { ExternalLink } from "lucide-react";

import { CopyField } from "@/components/shared/CopyField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type ShareLinkDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publicUrl: string;
  title: string;
  description: string;
  linkLabel: string;
  footnote: string;
};

export function ShareLinkDialog({ open, onOpenChange, publicUrl, title, description, linkLabel, footnote }: ShareLinkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>

        <div className="mt-5 space-y-4">
          <CopyField label={linkLabel} value={publicUrl} />
          <Button asChild variant="outline" className="h-10 w-full rounded-lg">
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden className="size-4" />
              Open client view
            </a>
          </Button>
          <p className="text-[12.5px] text-ink-500">{footnote}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
