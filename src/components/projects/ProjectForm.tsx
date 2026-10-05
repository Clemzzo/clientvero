"use client";

import { startTransition, useActionState, type SubmitEvent } from "react";
import Link from "next/link";

import { ComboboxField } from "@/components/shared/ComboboxField";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { FormAlert } from "@/components/shared/FormAlert";
import { FormSection } from "@/components/shared/FormSection";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { TextareaField } from "@/components/shared/TextareaField";
import { TextField } from "@/components/shared/TextField";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ProjectFormValues } from "@/features/projects/project-form-values";
import type { FormState } from "@/types/form-state";
import type { Option } from "@/types/option";

type ClientChoice = { kind: "select"; options: Option[] } | { kind: "fixed"; name: string; hint: string };

type ProjectFormProps = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  values: ProjectFormValues;
  client: ClientChoice;
  cancelHref: string;
  submitLabel: string;
};

export function ProjectForm({ action, values, client, cancelHref, submitLabel }: ProjectFormProps) {
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
          <FormSection title="Project" description="Who it's for and what you're delivering.">
            {client.kind === "select" ? (
              <ComboboxField
                name="clientId"
                label="Client"
                options={client.options}
                placeholder="Choose a client"
                searchPlaceholder="Search clients"
                defaultValue={values.clientId}
                required
                error={errorFor("clientId")}
              />
            ) : (
              <>
                <TextField name="clientName" label="Client" value={client.name} hint={client.hint} readOnly disabled />
                <input type="hidden" name="clientId" value={values.clientId} />
              </>
            )}
            {values.proposalId && <input type="hidden" name="proposalId" value={values.proposalId} />}
            <TextField
              name="name"
              label="Project name"
              autoComplete="off"
              required
              maxLength={240}
              defaultValue={values.name}
              error={errorFor("name")}
            />
            <TextareaField
              name="description"
              label="Description"
              hint="Optional. A short summary of the work."
              rows={4}
              maxLength={2000}
              defaultValue={values.description}
              error={errorFor("description")}
            />
          </FormSection>

          <FormSection title="Budget and dates" description="All optional. You can fill these in later.">
            <CurrencyInput
              amountName="budget"
              currencyName="currency"
              label="Budget"
              defaultAmount={values.budget}
              defaultCurrency={values.currency}
              amountError={errorFor("budget")}
              currencyError={errorFor("currency")}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                name="startDate"
                label="Start date"
                type="date"
                defaultValue={values.startDate}
                error={errorFor("startDate")}
              />
              <TextField
                name="dueDate"
                label="Due date"
                type="date"
                defaultValue={values.dueDate}
                error={errorFor("dueDate")}
              />
            </div>
          </FormSection>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" asChild className="h-11 rounded-lg">
            <Link href={cancelHref}>Cancel</Link>
          </Button>
          <SubmitButton pending={isPending} pendingLabel="Saving…" className="mt-0 h-11 rounded-lg sm:w-44">
            {submitLabel}
          </SubmitButton>
        </div>
      </fieldset>
    </form>
  );
}
