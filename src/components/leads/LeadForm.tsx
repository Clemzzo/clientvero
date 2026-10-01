"use client";

import { startTransition, useActionState, type SubmitEvent } from "react";
import Link from "next/link";

import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { FormAlert } from "@/components/shared/FormAlert";
import { FormSection } from "@/components/shared/FormSection";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { TextareaField } from "@/components/shared/TextareaField";
import { TextField } from "@/components/shared/TextField";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Lead } from "@/db/schema";
import type { FormState } from "@/types/form-state";

type LeadFormProps = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  defaultCurrency: string;
  lead?: Lead;
  cancelHref: string;
};

export function LeadForm({ action, defaultCurrency, lead, cancelHref }: LeadFormProps) {
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
          <FormSection title="Contact" description="Who you're talking to and how to reach them.">
            <TextField
              name="name"
              label="Name"
              autoComplete="off"
              required
              maxLength={200}
              defaultValue={lead?.name}
              error={errorFor("name")}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                name="email"
                label="Email"
                type="email"
                autoComplete="off"
                defaultValue={lead?.email ?? ""}
                error={errorFor("email")}
              />
              <TextField
                name="phone"
                label="Phone"
                type="tel"
                autoComplete="off"
                maxLength={40}
                defaultValue={lead?.phone ?? ""}
                error={errorFor("phone")}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                name="company"
                label="Company"
                autoComplete="off"
                maxLength={200}
                defaultValue={lead?.company ?? ""}
                error={errorFor("company")}
              />
              <TextField
                name="website"
                label="Website"
                inputMode="url"
                autoComplete="off"
                placeholder="example.com"
                defaultValue={lead?.website ?? ""}
                error={errorFor("website")}
              />
            </div>
          </FormSection>

          <FormSection title="Opportunity" description="What they need, where they came from, and what it's worth.">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                name="service"
                label="Service"
                hint="For example: Website redesign"
                maxLength={160}
                defaultValue={lead?.service ?? ""}
                error={errorFor("service")}
              />
              <TextField
                name="source"
                label="Source"
                hint="For example: Referral, LinkedIn"
                maxLength={100}
                defaultValue={lead?.source ?? ""}
                error={errorFor("source")}
              />
            </div>
            <CurrencyInput
              amountName="estimatedValue"
              currencyName="currency"
              label="Estimated value"
              defaultAmount={lead?.estimatedValue ?? ""}
              defaultCurrency={lead?.currency ?? defaultCurrency}
              amountError={errorFor("estimatedValue")}
              currencyError={errorFor("currency")}
            />
          </FormSection>

          <FormSection title="Notes" description="Anything worth remembering about this lead.">
            <TextareaField
              name="notes"
              label="Notes"
              rows={5}
              maxLength={5000}
              defaultValue={lead?.notes ?? ""}
              error={errorFor("notes")}
            />
          </FormSection>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" asChild className="h-11 rounded-lg">
            <Link href={cancelHref}>Cancel</Link>
          </Button>
          <SubmitButton pending={isPending} pendingLabel="Saving…" className="mt-0 h-11 rounded-lg sm:w-44">
            {lead ? "Save changes" : "Create lead"}
          </SubmitButton>
        </div>
      </fieldset>
    </form>
  );
}
