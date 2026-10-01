"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { startTransition, useActionState, useRef, type SubmitEvent } from "react";

import { FormAlert } from "@/components/shared/FormAlert";
import { FormField, fieldAria } from "@/components/shared/FormField";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { InputOTP, InputOTPSlot } from "@/components/ui/input-otp";
import type { PlanId } from "@/features/subscriptions/plans";
import { verifyEmailAction } from "@/server/actions/auth";

const OTP_LENGTH = 6;
const OTP_FIELD_ID = "field-otp";
const OTP_HINT = "The code expires in a few minutes.";

type VerifyEmailFormProps = {
  plan: PlanId | undefined;
};

export function VerifyEmailForm({ plan }: VerifyEmailFormProps) {
  const [state, submit, isPending] = useActionState(verifyEmailAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const otpError = state?.fieldErrors?.otp?.[0];

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => submit(formData));
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <fieldset disabled={isPending} className="space-y-5">
        {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}

        <FormField id={OTP_FIELD_ID} label="Verification code" hint={OTP_HINT} error={otpError}>
          <InputOTP
            name="otp"
            maxLength={OTP_LENGTH}
            pattern={REGEXP_ONLY_DIGITS}
            autoComplete="one-time-code"
            required
            autoFocus
            onComplete={() => formRef.current?.requestSubmit()}
            {...fieldAria(OTP_FIELD_ID, { hint: OTP_HINT, error: otpError })}
          >
            {Array.from({ length: OTP_LENGTH }, (_, index) => (
              <InputOTPSlot key={index} index={index} invalid={Boolean(otpError)} />
            ))}
          </InputOTP>
        </FormField>

        {plan && <input type="hidden" name="plan" value={plan} />}

        <SubmitButton pending={isPending} pendingLabel="Verifying…">
          Verify email
        </SubmitButton>
      </fieldset>
    </form>
  );
}
