"use client";

import { startTransition, useActionState, type SubmitEvent } from "react";
import Link from "next/link";

import { ComboboxField } from "@/components/shared/ComboboxField";
import { FormAlert } from "@/components/shared/FormAlert";
import { FormSection } from "@/components/shared/FormSection";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { TextareaField } from "@/components/shared/TextareaField";
import { TextField } from "@/components/shared/TextField";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Client } from "@/db/schema";
import type { FormState } from "@/types/form-state";
import type { Option } from "@/types/option";

type ClientFormProps = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  countries: Option[];
  client?: Client;
  cancelHref: string;
};

export function ClientForm({ action, countries, client, cancelHref }: ClientFormProps) {
  const [state, submit, isPending] = useActionState(action, null);
  const errorFor = (field: string) => state?.fieldErrors?.[field]?.[0];

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => submit(formData));
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={isPending} className="space-y-5">
        {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}

        <Card>
          <FormSection title="Contact details" description="The main way to reach this client.">
            <TextField
              name="name"
              label="Name"
              autoComplete="off"
              required
              maxLength={200}
              defaultValue={client?.name}
              error={errorFor("name")}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                name="email"
                label="Email"
                type="email"
                autoComplete="off"
                defaultValue={client?.email ?? ""}
                error={errorFor("email")}
              />
              <TextField
                name="phone"
                label="Phone"
                type="tel"
                autoComplete="off"
                maxLength={40}
                defaultValue={client?.phone ?? ""}
                error={errorFor("phone")}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                name="company"
                label="Company"
                autoComplete="off"
                maxLength={200}
                defaultValue={client?.company ?? ""}
                error={errorFor("company")}
              />
              <TextField
                name="website"
                label="Website"
                inputMode="url"
                autoComplete="off"
                placeholder="example.com"
                defaultValue={client?.website ?? ""}
                error={errorFor("website")}
              />
            </div>
          </FormSection>

          <FormSection title="Business" description="Where they're based and anything worth remembering.">
            <TextareaField
              name="address"
              label="Address"
              rows={3}
              maxLength={500}
              defaultValue={client?.address ?? ""}
              error={errorFor("address")}
            />
            <ComboboxField
              name="country"
              label="Country"
              options={countries}
              placeholder="Select a country"
              searchPlaceholder="Search countries"
              defaultValue={client?.country ?? ""}
              error={errorFor("country")}
            />
            <TextareaField
              name="notes"
              label="Notes"
              rows={5}
              maxLength={5000}
              defaultValue={client?.notes ?? ""}
              error={errorFor("notes")}
            />
          </FormSection>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" asChild className="h-11 rounded-lg">
            <Link href={cancelHref}>Cancel</Link>
          </Button>
          <SubmitButton pending={isPending} pendingLabel="Saving…" className="mt-0 h-11 rounded-lg sm:w-44">
            {client ? "Save changes" : "Create client"}
          </SubmitButton>
        </div>
      </fieldset>
    </form>
  );
}
