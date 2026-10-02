"use client";

import { startTransition, useActionState, useState, type SubmitEvent } from "react";
import { Check } from "lucide-react";

import { FormAlert } from "@/components/shared/FormAlert";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { TextareaField } from "@/components/shared/TextareaField";
import { TextField } from "@/components/shared/TextField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { acceptProposalAction, declineProposalAction, type ResponseState } from "@/server/actions/proposals";

type ProposalResponseBarProps = {
  publicId: string;
  organizationName: string;
  totalLabel: string;
};

type ResponseAction = (previous: ResponseState, formData: FormData) => Promise<ResponseState>;

function useResponseForm(action: ResponseAction) {
  const [state, submit, isPending] = useActionState(action, null);
  const formState = state && "error" in state ? state : null;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => submit(formData));
  }

  return { formState, isPending, handleSubmit };
}

function AcceptDialog({ publicId, organizationName }: { publicId: string; organizationName: string }) {
  const [signerName, setSignerName] = useState("");
  const { formState, isPending, handleSubmit } = useResponseForm(acceptProposalAction.bind(null, publicId));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-11 rounded-lg px-5">
          <Check aria-hidden className="size-4" />
          Accept proposal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Accept this proposal</DialogTitle>
        <DialogDescription>Type your full name to confirm you&rsquo;d like {organizationName} to go ahead.</DialogDescription>

        <form onSubmit={handleSubmit} className="mt-5">
          <fieldset disabled={isPending} className="space-y-4">
            {formState?.error && <FormAlert tone="error">{formState.error}</FormAlert>}
            <TextField
              name="signerName"
              label="Full name"
              autoComplete="name"
              maxLength={120}
              value={signerName}
              onChange={(event) => setSignerName(event.target.value)}
              error={formState?.fieldErrors?.signerName?.[0]}
            />
            <p className="text-[13px] leading-snug text-ink-500">
              By accepting, you agree to the scope, pricing and terms in this proposal.
            </p>
            <SubmitButton pending={isPending} pendingLabel="Accepting…" className="h-11 rounded-lg">
              {signerName.trim().length >= 2 ? `Accept as ${signerName.trim()}` : "Accept proposal"}
            </SubmitButton>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeclineDialog({ publicId }: { publicId: string }) {
  const { formState, isPending, handleSubmit } = useResponseForm(declineProposalAction.bind(null, publicId));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 rounded-lg">
          Decline
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Decline this proposal</DialogTitle>
        <DialogDescription>Let them know why, if you&rsquo;d like. This can&rsquo;t be undone.</DialogDescription>

        <form onSubmit={handleSubmit} className="mt-5">
          <fieldset disabled={isPending} className="space-y-4">
            {formState?.error && <FormAlert tone="error">{formState.error}</FormAlert>}
            <TextareaField
              name="reason"
              label="Reason (optional)"
              rows={4}
              maxLength={1000}
              error={formState?.fieldErrors?.reason?.[0]}
            />
            <SubmitButton pending={isPending} pendingLabel="Declining…" className="h-11 rounded-lg bg-destructive hover:bg-destructive/90">
              Decline proposal
            </SubmitButton>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ProposalResponseBar({ publicId, organizationName, totalLabel }: ProposalResponseBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-200 bg-white/90 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-190 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-0">
        <div className="flex items-baseline justify-between gap-3 sm:block">
          <p className="text-[13px] text-ink-500">Ready to go ahead?</p>
          <p className="font-display text-[18px] font-bold tabular-nums text-ink-900">{totalLabel}</p>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-2 sm:flex">
          <DeclineDialog publicId={publicId} />
          <AcceptDialog publicId={publicId} organizationName={organizationName} />
        </div>
      </div>
    </div>
  );
}
