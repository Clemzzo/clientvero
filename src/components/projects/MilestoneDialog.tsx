"use client";

import { startTransition, useActionState, useCallback, useEffect, useState, type ReactNode, type SubmitEvent } from "react";

import { useNotice } from "@/components/shared/notice-provider";
import { FormAlert } from "@/components/shared/FormAlert";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { TextareaField } from "@/components/shared/TextareaField";
import { TextField } from "@/components/shared/TextField";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Milestone } from "@/db/schema";
import { saveMilestoneAction, type MilestoneFormState } from "@/server/actions/projects";

type MilestoneDialogProps = {
  projectId: string;
  milestone?: Milestone;
  trigger: ReactNode;
};

export function MilestoneDialog({ projectId, milestone, trigger }: MilestoneDialogProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>{milestone ? "Edit milestone" : "Add milestone"}</DialogTitle>
        <DialogDescription>
          {milestone ? "Update this milestone's details." : "A step on the way to finishing the project."}
        </DialogDescription>
        {open && <MilestoneForm projectId={projectId} milestone={milestone} onSaved={close} />}
      </DialogContent>
    </Dialog>
  );
}

type MilestoneFormProps = {
  projectId: string;
  milestone?: Milestone;
  onSaved: () => void;
};

function MilestoneForm({ projectId, milestone, onSaved }: MilestoneFormProps) {
  const [state, submit, isPending] = useActionState<MilestoneFormState, FormData>(
    saveMilestoneAction.bind(null, { projectId, milestoneId: milestone?.id }),
    null,
  );
  const showNotice = useNotice();
  const saved = state !== null && "success" in state;
  const formState = saved ? null : state;
  const errorFor = (field: string) => formState?.fieldErrors?.[field]?.[0];

  useEffect(() => {
    if (!saved) return;
    showNotice("success", milestone ? "Milestone updated." : "Milestone added.");
    onSaved();
  }, [saved, milestone, showNotice, onSaved]);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => submit(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5">
      <fieldset disabled={isPending} className="space-y-4">
        {formState?.error && <FormAlert tone="error">{formState.error}</FormAlert>}

        <TextField name="name" label="Name" required maxLength={240} defaultValue={milestone?.name} error={errorFor("name")} />
        <TextareaField
          name="description"
          label="Description"
          hint="Optional."
          rows={3}
          maxLength={2000}
          defaultValue={milestone?.description ?? ""}
          error={errorFor("description")}
        />
        <TextField name="dueDate" label="Due date" type="date" defaultValue={milestone?.dueDate ?? ""} error={errorFor("dueDate")} />

        <SubmitButton pending={isPending} pendingLabel="Saving…" className="h-11 rounded-lg">
          {milestone ? "Save milestone" : "Add milestone"}
        </SubmitButton>
      </fieldset>
    </form>
  );
}
