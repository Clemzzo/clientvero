"use client";

import { startTransition, useActionState, useState, type SubmitEvent } from "react";
import { UserPlus } from "lucide-react";

import { CopyField } from "@/components/shared/CopyField";
import { FormAlert } from "@/components/shared/FormAlert";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { TextField } from "@/components/shared/TextField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { roleDescriptions, roleLabels } from "@/features/settings/team-roles";
import { inviteMemberAction } from "@/server/actions/team";
import { assignableRoles } from "@/validators/settings";

function InviteForm() {
  const [state, submit, isPending] = useActionState(inviteMemberAction, null);
  const errorFor = (field: string) => state?.fieldErrors?.[field]?.[0];

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => submit(formData));
  }

  if (state?.link) {
    return (
      <div>
        <DialogTitle>Invitation ready</DialogTitle>
        <DialogDescription>
          Send this link to <span className="font-medium text-ink-900">{state.email}</span>. It works once and expires in 7 days.
        </DialogDescription>
        <div className="mt-5 space-y-3">
          <CopyField label="Invitation link" value={state.link} />
          <p className="text-[12.5px] text-ink-500">
            They&apos;ll need to sign in or create an account with this email address. Email delivery is coming in a later update.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle>Invite a teammate</DialogTitle>
      <DialogDescription>They&apos;ll get a link to join your workspace.</DialogDescription>

      <fieldset disabled={isPending} className="mt-5 space-y-5">
        {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}
        <TextField
          name="email"
          label="Email address"
          type="email"
          autoComplete="off"
          required
          maxLength={320}
          placeholder="name@company.com"
          error={errorFor("email")}
        />

        <fieldset className="space-y-2">
          <legend className="text-[14px] font-medium text-ink-900">Role</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {assignableRoles.map((option) => (
              <label
                key={option}
                className="cursor-pointer rounded-xl border border-ink-200 p-3 transition-colors hover:border-ink-400 has-checked:border-brand-500 has-checked:bg-brand-50/70 has-checked:ring-1 has-checked:ring-brand-500 has-focus-visible:outline-2 has-focus-visible:outline-brand-600"
              >
                <input type="radio" name="role" value={option} defaultChecked={option === "MEMBER"} className="sr-only" />
                <span className="block text-[14px] font-semibold text-ink-900">{roleLabels[option]}</span>
                <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-500">{roleDescriptions[option]}</span>
              </label>
            ))}
          </div>
          {errorFor("role") && <p className="text-[13px] text-red-700">{errorFor("role")}</p>}
        </fieldset>

        <SubmitButton pending={isPending} pendingLabel="Creating invitation…" className="mt-0 h-11 rounded-lg">
          Create invitation link
        </SubmitButton>
      </fieldset>
    </form>
  );
}

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setFormKey((key) => key + 1);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-lg">
          <UserPlus aria-hidden className="size-4" />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <InviteForm key={formKey} />
      </DialogContent>
    </Dialog>
  );
}
