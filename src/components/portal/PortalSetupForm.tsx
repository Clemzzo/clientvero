"use client";

import { startTransition, useActionState, type SubmitEvent } from "react";

import { PasswordField } from "@/components/auth/PasswordField";
import { FormAlert } from "@/components/shared/FormAlert";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { TextField } from "@/components/shared/TextField";
import { completePortalSetupAction } from "@/server/actions/portal";

type PortalSetupFormProps = {
  slug: string;
  token: string;
  email: string;
  isReset: boolean;
};

export function PortalSetupForm({ slug, token, email, isReset }: PortalSetupFormProps) {
  const [state, submit, isPending] = useActionState(completePortalSetupAction.bind(null, { slug, token }), null);
  const errorFor = (field: string) => state?.fieldErrors?.[field]?.[0];

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => submit(formData));
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={isPending} className="space-y-4">
        {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}

        <TextField name="email" label="Email" value={email} autoComplete="username" readOnly disabled />
        <PasswordField
          name="password"
          label={isReset ? "New password" : "Password"}
          hint="At least 10 characters."
          autoComplete="new-password"
          required
          minLength={10}
          maxLength={128}
          error={errorFor("password")}
        />
        <PasswordField
          name="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          required
          error={errorFor("confirmPassword")}
        />

        <SubmitButton pending={isPending} pendingLabel="Saving…" className="h-11 rounded-lg">
          {isReset ? "Save new password" : "Set password and continue"}
        </SubmitButton>
      </fieldset>
    </form>
  );
}
