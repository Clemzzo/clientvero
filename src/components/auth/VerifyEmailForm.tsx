"use client";

import { startTransition, useActionState, type SubmitEvent } from "react";

import { FormAlert } from "@/components/shared/FormAlert";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { TextField } from "@/components/shared/TextField";
import type { PlanId } from "@/features/subscriptions/plans";
import { verifyEmailAction } from "@/server/actions/auth";

type VerifyEmailFormProps = {
  plan: PlanId | undefined;
};

export function VerifyEmailForm({ plan }: VerifyEmailFormProps) {
  const [state, submit, isPending] = useActionState(verifyEmailAction, null);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => submit(formData));
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={isPending} className="space-y-5">
        {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}

        <TextField
          name="otp"
          label="Verification code"
          hint="The code expires in a few minutes."
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          className="tracking-[0.3em]"
          error={state?.fieldErrors?.otp?.[0]}
        />

        {plan && <input type="hidden" name="plan" value={plan} />}

        <SubmitButton pending={isPending} pendingLabel="Verifying…">
          Verify email
        </SubmitButton>
      </fieldset>
    </form>
  );
}
