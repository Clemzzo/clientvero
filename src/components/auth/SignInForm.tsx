"use client";

import { startTransition, useActionState, type SubmitEvent } from "react";
import Link from "next/link";

import { PasswordField } from "@/components/auth/PasswordField";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";
import { CheckboxField } from "@/components/shared/CheckboxField";
import { FormAlert } from "@/components/shared/FormAlert";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { TextField } from "@/components/shared/TextField";
import { signInAction } from "@/server/actions/auth";

type SignInFormProps = {
  next: string | undefined;
};

export function SignInForm({ next }: SignInFormProps) {
  const [state, submit, isPending] = useActionState(signInAction, null);

  function errorFor(field: "email" | "password") {
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

        <TextField
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          error={errorFor("email")}
        />

        <PasswordField
          name="password"
          label="Password"
          autoComplete="current-password"
          required
          error={errorFor("password")}
        />

        <CheckboxField name="rememberMe" label="Remember me" />

        {next && <input type="hidden" name="next" value={next} />}

        <TurnstileWidget action="login" resetKey={state} />

        <SubmitButton pending={isPending} pendingLabel="Signing in…">
          Sign in
        </SubmitButton>
      </fieldset>

      <p className="mt-6 text-[14px] text-ink-500">
        New to ClientVero?{" "}
        <Link href="/sign-up" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
