"use client";

import { startTransition, useActionState, useState, type ChangeEvent, type SubmitEvent } from "react";
import Link from "next/link";

import { SectionEditor } from "@/components/proposals/SectionEditor";
import { useSections } from "@/components/proposals/use-sections";
import { ComboboxField } from "@/components/shared/ComboboxField";
import { FormAlert } from "@/components/shared/FormAlert";
import { MoneyField } from "@/components/shared/MoneyField";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { TextareaField } from "@/components/shared/TextareaField";
import { TextField } from "@/components/shared/TextField";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { currencyOptions } from "@/features/organizations/business-profile";
import type { ProposalBuilderValues } from "@/features/proposals/builder-values";
import { formatMoney } from "@/lib/utils/format";
import { proposalTotal } from "@/lib/utils/money";
import type { FormState } from "@/types/form-state";
import type { Option } from "@/types/option";

type ProposalBuilderProps = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  clients: Option[];
  values: ProposalBuilderValues;
  cancelHref: string;
  submitLabel: string;
};

const currencies = currencyOptions();

function normalizeAmount(value: string) {
  const cleaned = value.replaceAll(",", "").trim();
  return /^\d{1,12}(\.\d{1,2})?$/.test(cleaned) ? cleaned : null;
}

function liveTotal(subtotal: string, discount: string, tax: string) {
  const amounts = [subtotal, discount || "0", tax || "0"].map(normalizeAmount);
  if (amounts.some((amount) => amount === null)) return null;

  const [amount, less, plus] = amounts as string[];
  return proposalTotal({ subtotal: amount, discount: less, tax: plus });
}

export function ProposalBuilder({ action, clients, values, cancelHref, submitLabel }: ProposalBuilderProps) {
  const [state, submit, isPending] = useActionState(action, null);
  const { sections, dispatch, serialized } = useSections(values.sections);
  const [currency, setCurrency] = useState(values.currency);
  const [amounts, setAmounts] = useState({ subtotal: values.subtotal, discount: values.discount, tax: values.tax });
  const errorFor = (field: string) => state?.fieldErrors?.[field]?.[0];
  const total = liveTotal(amounts.subtotal, amounts.discount, amounts.tax);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => submit(formData));
  }

  function amountField(name: keyof typeof amounts) {
    return {
      name,
      currency,
      value: amounts[name],
      error: errorFor(name),
      onChange: (event: ChangeEvent<HTMLInputElement>) => setAmounts((current) => ({ ...current, [name]: event.target.value })),
    };
  }

  return (
    <form onSubmit={handleSubmit} className="pb-24 lg:pb-0">
      <input type="hidden" name="sections" value={serialized} />

      <fieldset disabled={isPending} className="space-y-5">
        {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-6">
            <Card>
              <CardHeader title="Basics" description="Who it's for and what it's called." />
              <div className="space-y-5 p-5 sm:p-6">
                {clients.length === 0 ? (
                  <FormAlert tone="error">
                    You need a client first.{" "}
                    <Link href="/dashboard/clients/new" className="font-semibold underline underline-offset-4">
                      Add a client
                    </Link>
                  </FormAlert>
                ) : (
                  <ComboboxField
                    name="clientId"
                    label="Client"
                    options={clients}
                    placeholder="Choose a client"
                    searchPlaceholder="Search clients"
                    defaultValue={values.clientId}
                    required
                    error={errorFor("clientId")}
                  />
                )}
                <TextField
                  name="title"
                  label="Title"
                  placeholder="Website redesign"
                  required
                  maxLength={240}
                  defaultValue={values.title}
                  error={errorFor("title")}
                />
                <TextareaField
                  name="description"
                  label="Summary"
                  hint="One or two sentences shown under the title."
                  rows={2}
                  maxLength={500}
                  defaultValue={values.description}
                  error={errorFor("description")}
                />
              </div>
            </Card>

            <SectionEditor sections={sections} dispatch={dispatch} error={errorFor("sections")} />

            <Card>
              <CardHeader title="Timeline and terms" description="Optional. Shown at the end of the proposal." />
              <div className="space-y-5 p-5 sm:p-6">
                <TextareaField
                  name="timeline"
                  label="Timeline"
                  rows={3}
                  maxLength={2000}
                  placeholder="Six weeks from kickoff, with a review at the halfway point."
                  defaultValue={values.timeline}
                  error={errorFor("timeline")}
                />
                <TextareaField
                  name="terms"
                  label="Terms"
                  rows={5}
                  maxLength={10_000}
                  placeholder="50% upfront, 50% on delivery. Two rounds of revisions included."
                  defaultValue={values.terms}
                  error={errorFor("terms")}
                />
              </div>
            </Card>
          </div>

          <aside className="lg:sticky lg:top-24">
            <Card>
              <CardHeader title="Pricing" description="Totals are recalculated when you save." />
              <div className="space-y-4 p-5 sm:p-6">
                <ComboboxField
                  name="currency"
                  label="Currency"
                  options={currencies}
                  searchPlaceholder="Search currencies"
                  defaultValue={values.currency}
                  required
                  onValueChange={setCurrency}
                  error={errorFor("currency")}
                />
                <MoneyField label="Amount" required {...amountField("subtotal")} />
                <MoneyField label="Discount (optional)" {...amountField("discount")} />
                <MoneyField label="Tax (optional)" {...amountField("tax")} />

                <div className="flex items-end justify-between gap-3 rounded-xl border border-mint-200 bg-mint-50 px-4 py-3.5">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-mint-800">Total</p>
                  <p aria-live="polite" className="font-display text-[24px] font-bold leading-none tabular-nums text-mint-800">
                    {total ? formatMoney(total, currency) : "—"}
                  </p>
                </div>
              </div>

              <div className="hidden gap-2 border-t border-ink-200 p-5 sm:p-6 lg:grid">
                <SubmitButton pending={isPending} pendingLabel="Saving…" className="mt-0 h-11 rounded-lg">
                  {submitLabel}
                </SubmitButton>
                <Button variant="ghost" asChild className="h-10 rounded-lg">
                  <Link href={cancelHref}>Cancel</Link>
                </Button>
              </div>
            </Card>
          </aside>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-ink-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <Button variant="outline" asChild className="h-11 flex-1 rounded-lg">
            <Link href={cancelHref}>Cancel</Link>
          </Button>
          <SubmitButton pending={isPending} pendingLabel="Saving…" className="mt-0 h-11 flex-[2] rounded-lg">
            {submitLabel}
          </SubmitButton>
        </div>
      </fieldset>
    </form>
  );
}
