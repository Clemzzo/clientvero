"use client";

import { startTransition, useActionState, type SubmitEvent } from "react";
import Link from "next/link";

import { PasswordField } from "@/components/auth/PasswordField";
import { FormAlert } from "@/components/shared/FormAlert";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { resetPasswordAction } from "@/server/actions/auth";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, submit, isPending] = useActionState(resetPasswordAction, null);

  function errorFor(field: "password" | "confirmPassword") {
    return state?.fieldErrors?.[field]?.[0];
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => submit(formData));
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={isPending} className="space-y-5">
        {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}

        <input type="hidden" name="token" value={token} />
        <PasswordField
          name="password"
          label="New password"
          hint="At least 8 characters."
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          error={errorFor("password")}
        />
        <PasswordField
          name="confirmPassword"
          label="Confirm new password"
          autoComplete="new-password"
          required
          error={errorFor("confirmPassword")}
        />

        <SubmitButton pending={isPending} pendingLabel="Saving…">
          Update password
        </SubmitButton>
      </fieldset>

      <p className="mt-6 text-[14px] text-ink-500">
        Link not working?{" "}
        <Link href="/forgot-password" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
          Request a new one
        </Link>
      </p>
    </form>
  );
}
