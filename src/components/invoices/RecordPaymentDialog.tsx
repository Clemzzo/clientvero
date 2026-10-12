"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type SubmitEvent } from "react";

import { FormAlert } from "@/components/shared/FormAlert";
import { MoneyField } from "@/components/shared/MoneyField";
import { useNotice } from "@/components/shared/notice-provider";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { TextareaField } from "@/components/shared/TextareaField";
import { TextField } from "@/components/shared/TextField";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { localTodayIso } from "@/features/invoices/invoice-dates";
import { paymentMethodLabels, paymentMethods } from "@/features/invoices/payment-methods";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/utils/format";
import { recordPaymentAction, type PaymentFormState } from "@/server/actions/invoices";

import { paymentMethodIcons } from "./payment-method-icons";

type RecordPaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber: string;
  currency: string;
  amountDue: string;
};

function PaymentForm({ invoiceId, currency, amountDue, onDone }: Omit<RecordPaymentDialogProps, "open" | "onOpenChange" | "invoiceNumber"> & { onDone: () => void }) {
  const [paymentId] = useState(() => crypto.randomUUID());
  const [today] = useState(() => localTodayIso());
  const [state, submit, isPending] = useActionState<PaymentFormState, FormData>(recordPaymentAction.bind(null, invoiceId), null);
  const handled = useRef(false);
  const failed = state && !("done" in state) ? state : null;
  const errorFor = (field: string) => failed?.fieldErrors?.[field]?.[0];

  useEffect(() => {
    if (!state || !("done" in state) || handled.current) return;
    handled.current = true;
    onDone();
  }, [state, onDone]);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => submit(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5">
      <input type="hidden" name="id" value={paymentId} />
      <fieldset disabled={isPending} className="space-y-5">
        {failed?.error && <FormAlert tone="error">{failed.error}</FormAlert>}

        <div className="grid gap-5 sm:grid-cols-2">
          <MoneyField
            name="amount"
            label="Amount received"
            currency={currency}
            required
            defaultValue={amountDue}
            error={errorFor("amount")}
          />
          <TextField name="paidAt" label="Paid on" type="date" required max={today} defaultValue={today} error={errorFor("paidAt")} />
        </div>

        <fieldset>
          <legend className="text-[14px] font-medium text-ink-900">How were you paid?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {paymentMethods.map((method, index) => (
              <label
                key={method}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-[14px] text-ink-700 transition-colors hover:bg-ink-50",
                  "has-checked:border-mint-500 has-checked:bg-mint-50 has-checked:text-mint-800",
                  "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-600",
                  "[&_svg]:size-4 [&_svg]:text-mint-600",
                )}
              >
                <input type="radio" name="method" value={method} defaultChecked={index === 0} className="sr-only" />
                {paymentMethodIcons[method]}
                {paymentMethodLabels[method]}
              </label>
            ))}
          </div>
          {errorFor("method") && <p className="mt-2 text-[13px] text-destructive">{errorFor("method")}</p>}
        </fieldset>

        <TextField name="reference" label="Reference (optional)" maxLength={120} placeholder="Bank reference or receipt number" error={errorFor("reference")} />
        <TextareaField name="note" label="Note (optional)" rows={2} maxLength={500} error={errorFor("note")} />

        <SubmitButton pending={isPending} pendingLabel="Recording…" className="h-11 rounded-lg">
          Record payment
        </SubmitButton>
      </fieldset>
    </form>
  );
}

export function RecordPaymentDialog({ open, onOpenChange, invoiceNumber, ...form }: RecordPaymentDialogProps) {
  const showNotice = useNotice();

  function done() {
    onOpenChange(false);
    showNotice("success", `Payment recorded on ${invoiceNumber}.`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Record a payment</DialogTitle>
        <DialogDescription>
          {formatMoney(form.amountDue, form.currency)} is still due on {invoiceNumber}. Leave the full amount to mark it paid.
        </DialogDescription>
        <PaymentForm {...form} onDone={done} />
      </DialogContent>
    </Dialog>
  );
}
