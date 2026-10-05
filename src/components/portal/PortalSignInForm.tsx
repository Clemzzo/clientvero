"use client";

import { startTransition, useActionState, type SubmitEvent } from "react";

import { PasswordField } from "@/components/auth/PasswordField";
import { FormAlert } from "@/components/shared/FormAlert";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { TextField } from "@/components/shared/TextField";
import { portalSignInAction } from "@/server/actions/portal";

export function PortalSignInForm({ slug }: { slug: string }) {
  const [state, submit, isPending] = useActionState(portalSignInAction.bind(null, slug), null);
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

        <TextField name="email" label="Email" type="email" autoComplete="username" required error={errorFor("email")} />
        <PasswordField
          name="password"
          label="Password"
          autoComplete="current-password"
          required
          error={errorFor("password")}
        />

        <SubmitButton pending={isPending} pendingLabel="Signing in…" className="h-11 rounded-lg">
          Sign in
        </SubmitButton>
      </fieldset>
    </form>
  );
}
