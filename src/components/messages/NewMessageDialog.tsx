"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SquarePen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Option } from "@/types/option";

export function NewMessageDialog({ projects }: { projects: Option[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-lg px-3.5">
          <SquarePen aria-hidden className="size-4" />
          New message
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogTitle>New message</DialogTitle>
        <DialogDescription>Each project has one conversation with its client. Choose the project to message about.</DialogDescription>
        <div className="mt-5">
          {projects.length === 0 ? (
            <p className="rounded-lg bg-ink-50 px-4 py-3 text-[14px] text-ink-700">Create a project first, then message its client here.</p>
          ) : (
            <>
              <label htmlFor="new-message-project" className="mb-1.5 block text-[14px] font-medium text-ink-900">
                Project
              </label>
              <Combobox
                id="new-message-project"
                name="projectId"
                options={projects}
                placeholder="Choose a project"
                searchPlaceholder="Search projects or clients"
                onValueChange={(projectId) => {
                  if (!projectId) return;
                  setOpen(false);
                  router.push(`/dashboard/messages/${projectId}`);
                }}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
