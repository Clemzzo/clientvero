"use client";

import { startTransition, useActionState, type SubmitEvent } from "react";
import Link from "next/link";

import { TurnstileWidget } from "@/components/auth/TurnstileWidget";
import { FormAlert } from "@/components/shared/FormAlert";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { TextField } from "@/components/shared/TextField";
import { requestPasswordResetAction } from "@/server/actions/auth";

export function ForgotPasswordForm() {
  const [state, submit, isPending] = useActionState(requestPasswordResetAction, null);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => submit(formData));
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={isPending} className="space-y-5">
        {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}
        {state?.message && <FormAlert tone="success">{state.message}</FormAlert>}

        <TextField
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          error={state?.fieldErrors?.email?.[0]}
        />

        <TurnstileWidget action="password-reset" resetKey={state} />

        <SubmitButton pending={isPending} pendingLabel="Sending…">
          Send reset link
        </SubmitButton>
      </fieldset>

      <p className="mt-6 text-[14px] text-ink-500">
        Remembered it?{" "}
        <Link href="/sign-in" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
