"use client";

import { startTransition, useActionState, useCallback, useEffect, useState, type ReactNode, type SubmitEvent } from "react";

import { useNotice } from "@/components/shared/notice-provider";
import { CheckboxField } from "@/components/shared/CheckboxField";
import { FormAlert } from "@/components/shared/FormAlert";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { TextField } from "@/components/shared/TextField";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { ClientContact } from "@/db/schema";
import { saveContactAction, type ContactFormState } from "@/server/actions/clients";

type ContactDialogProps = {
  clientId: string;
  contact?: ClientContact;
  trigger: ReactNode;
};

export function ContactDialog({ clientId, contact, trigger }: ContactDialogProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>{contact ? "Edit contact" : "Add contact"}</DialogTitle>
        <DialogDescription>
          {contact ? "Update this person's details." : "Add someone you work with at this client."}
        </DialogDescription>
        {open && <ContactForm clientId={clientId} contact={contact} onSaved={close} />}
      </DialogContent>
    </Dialog>
  );
}

type ContactFormProps = {
  clientId: string;
  contact?: ClientContact;
  onSaved: () => void;
};

function ContactForm({ clientId, contact, onSaved }: ContactFormProps) {
  const [state, submit, isPending] = useActionState<ContactFormState, FormData>(
    saveContactAction.bind(null, { clientId, contactId: contact?.id }),
    null,
  );
  const showNotice = useNotice();
  const saved = state !== null && "success" in state;
  const formState = saved ? null : state;
  const errorFor = (field: string) => formState?.fieldErrors?.[field]?.[0];

  useEffect(() => {
    if (!saved) return;
    showNotice("success", contact ? "Contact updated." : "Contact added.");
    onSaved();
  }, [saved, contact, showNotice, onSaved]);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => submit(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5">
      <fieldset disabled={isPending} className="space-y-4">
        {formState?.error && <FormAlert tone="error">{formState.error}</FormAlert>}

        <TextField name="name" label="Name" required maxLength={200} defaultValue={contact?.name} error={errorFor("name")} />
        <TextField name="role" label="Role" hint="For example: Marketing lead" maxLength={120} defaultValue={contact?.role ?? ""} error={errorFor("role")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="email" label="Email" type="email" defaultValue={contact?.email ?? ""} error={errorFor("email")} />
          <TextField name="phone" label="Phone" type="tel" maxLength={40} defaultValue={contact?.phone ?? ""} error={errorFor("phone")} />
        </div>
        <CheckboxField
          name="isPrimary"
          label="Primary contact"
          hint="The main person you deal with at this client."
          defaultChecked={contact?.isPrimary ?? false}
        />

        <SubmitButton pending={isPending} pendingLabel="Saving…" className="h-11 rounded-lg">
          {contact ? "Save contact" : "Add contact"}
        </SubmitButton>
      </fieldset>
    </form>
  );
}
