"use client";

import { startTransition, useActionState, useState, type SubmitEvent } from "react";
import Link from "next/link";
import { Building2, Eye, Landmark } from "lucide-react";

import { ComboboxField } from "@/components/shared/ComboboxField";
import { FormAlert } from "@/components/shared/FormAlert";
import { MoneyField } from "@/components/shared/MoneyField";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { TextareaField } from "@/components/shared/TextareaField";
import { TextField } from "@/components/shared/TextField";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { InvoiceStatus } from "@/db/schema";
import type { InvoiceBuilderValues } from "@/features/invoices/builder-values";
import type { InvoiceDocumentData, InvoiceParty } from "@/features/invoices/invoice-document";
import { previewTotals } from "@/features/invoices/preview-totals";
import { currencyOptions } from "@/features/organizations/business-profile";
import type { BillableClient, ProjectOption } from "@/server/repositories/invoice.repository";
import type { FormState } from "@/types/form-state";

import { DueDateChips } from "./DueDateChips";
import { InvoiceDocument } from "./InvoiceDocument";
import { LineItemsGrid } from "./LineItemsGrid";
import { useLineItems } from "./use-line-items";

type InvoiceBuilderProps = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  clients: BillableClient[];
  projects: ProjectOption[];
  business: InvoiceParty;
  invoiceNumber: string;
  status: InvoiceStatus;
  values: InvoiceBuilderValues;
  cancelHref: string;
  submitLabel: string;
};

const currencies = currencyOptions();
const noProject = { value: "", label: "No project" };
const emptyParty: InvoiceParty = { name: "", lines: [] };

export function InvoiceBuilder({
  action,
  clients,
  projects,
  business,
  invoiceNumber,
  status,
  values,
  cancelHref,
  submitLabel,
}: InvoiceBuilderProps) {
  const [state, submit, isPending] = useActionState(action, null);
  const { lines, dispatch, serialized } = useLineItems(values.items);
  const [clientId, setClientId] = useState(values.clientId);
  const [projectId, setProjectId] = useState(values.projectId);
  const [currency, setCurrency] = useState(values.currency);
  const [dates, setDates] = useState({ issueDate: values.issueDate, dueDate: values.dueDate });
  const [discount, setDiscount] = useState(values.discount);
  const [notes, setNotes] = useState(values.notes);
  const [paymentInstructions, setPaymentInstructions] = useState(values.paymentInstructions);
  const [previewOpen, setPreviewOpen] = useState(false);
  const errorFor = (field: string) => state?.fieldErrors?.[field]?.[0];

  const totals = previewTotals(lines, discount);
  const clientProjects = [noProject, ...projects.filter((project) => project.clientId === clientId)];

  const preview: InvoiceDocumentData = {
    invoiceNumber,
    status,
    currency,
    issueDate: dates.issueDate || values.issueDate,
    dueDate: dates.dueDate || values.dueDate,
    items: lines.map((line, index) => ({
      description: line.description,
      quantity: totals.items[index].quantity,
      unitPrice: totals.items[index].unitPrice,
      amount: totals.amounts[index],
    })),
    subtotal: totals.subtotal,
    discount: totals.discount,
    total: totals.total,
    amountPaid: "0",
    amountDue: totals.total,
    notes: notes.trim() || null,
    paymentInstructions: paymentInstructions.trim() || null,
    business,
    client: clients.find((client) => client.value === clientId)?.party ?? emptyParty,
  };

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => submit(formData));
  }

  function chooseClient(next: string) {
    setClientId(next);
    if (!projects.some((project) => project.value === projectId && project.clientId === next)) setProjectId("");
  }

  return (
    <form onSubmit={handleSubmit} className="pb-24 lg:pb-0">
      <input type="hidden" name="items" value={serialized} />

      <fieldset disabled={isPending} className="space-y-5">
        {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0 space-y-6">
            <Card>
              <CardHeader title="Bill to" description="Who pays, for which project, and by when." icon={{ node: <Building2 />, tone: "brand" }} />
              <div className="space-y-5 p-5 sm:p-6">
                {clients.length === 0 ? (
                  <FormAlert tone="error">
                    You need a client first.{" "}
                    <Link href="/dashboard/clients/new" className="font-semibold underline underline-offset-4">
                      Add a client
                    </Link>
                  </FormAlert>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <ComboboxField
                      name="clientId"
                      label="Client"
                      options={clients}
                      placeholder="Choose a client"
                      searchPlaceholder="Search clients"
                      defaultValue={values.clientId}
                      required
                      onValueChange={chooseClient}
                      error={errorFor("clientId")}
                    />
                    <ComboboxField
                      key={clientId}
                      name="projectId"
                      label="Project (optional)"
                      options={clientProjects}
                      placeholder="No project"
                      defaultValue={projectId}
                      onValueChange={setProjectId}
                      error={errorFor("projectId")}
                    />
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    name="issueDate"
                    label="Issued"
                    type="date"
                    required
                    value={dates.issueDate}
                    onChange={(event) => setDates((current) => ({ ...current, issueDate: event.target.value }))}
                    error={errorFor("issueDate")}
                  />
                  <div className="space-y-2.5">
                    <TextField
                      name="dueDate"
                      label="Due"
                      type="date"
                      required
                      min={dates.issueDate || undefined}
                      value={dates.dueDate}
                      onChange={(event) => setDates((current) => ({ ...current, dueDate: event.target.value }))}
                      error={errorFor("dueDate")}
                    />
                    <DueDateChips
                      issueDate={dates.issueDate}
                      dueDate={dates.dueDate}
                      onPick={(dueDate) => setDates((current) => ({ ...current, dueDate }))}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <LineItemsGrid lines={lines} amounts={totals.amounts} currency={currency} dispatch={dispatch} error={errorFor("items")} />

            <Card>
              <CardHeader title="Currency and discount" description="Totals are recalculated when you save." />
              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
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
                <MoneyField
                  name="discount"
                  label="Discount (optional)"
                  currency={currency}
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value)}
                  error={errorFor("discount")}
                />
              </div>
            </Card>

            <Card>
              <CardHeader title="Payment details" description="Both appear on the invoice your client sees." icon={{ node: <Landmark />, tone: "grape" }} />
              <div className="space-y-5 p-5 sm:p-6">
                <TextareaField
                  name="paymentInstructions"
                  label="How to pay"
                  hint="Bank details, payment link or other instructions. Saved for your next invoice."
                  rows={4}
                  maxLength={2000}
                  placeholder={"Bank transfer to Acme Studio Ltd\nAccount 12345678, sort code 12-34-56"}
                  value={paymentInstructions}
                  onChange={(event) => setPaymentInstructions(event.target.value)}
                  error={errorFor("paymentInstructions")}
                />
                <TextareaField
                  name="notes"
                  label="Note to client (optional)"
                  rows={3}
                  maxLength={2000}
                  placeholder="Thanks for working with us."
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  error={errorFor("notes")}
                />
              </div>
            </Card>
          </div>

          <aside aria-label="Invoice preview" className="hidden space-y-4 lg:sticky lg:top-24 lg:block">
            <p className="text-[13px] text-ink-500">What your client will see</p>
            <InvoiceDocument invoice={preview} compact />
            <div className="grid gap-2">
              <SubmitButton pending={isPending} pendingLabel="Saving…" className="mt-0 h-11 rounded-lg">
                {submitLabel}
              </SubmitButton>
              <Button variant="ghost" asChild className="h-10 rounded-lg">
                <Link href={cancelHref}>Cancel</Link>
              </Button>
            </div>
          </aside>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-ink-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <Button type="button" variant="outline" className="h-11 rounded-lg" onClick={() => setPreviewOpen(true)}>
            <Eye aria-hidden className="size-4" />
            Preview
          </Button>
          <Button variant="ghost" asChild className="h-11 flex-1 rounded-lg">
            <Link href={cancelHref}>Cancel</Link>
          </Button>
          <SubmitButton pending={isPending} pendingLabel="Saving…" className="mt-0 h-11 flex-[2] rounded-lg">
            {submitLabel}
          </SubmitButton>
        </div>
      </fieldset>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl bg-ink-100 p-3 pt-14 sm:p-5 sm:pt-14">
          <DialogTitle className="sr-only">Invoice preview</DialogTitle>
          <InvoiceDocument invoice={preview} />
        </DialogContent>
      </Dialog>
    </form>
  );
}
