"use client";

import { startTransition, useActionState, useState, type SubmitEvent } from "react";
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
  const [verified, setVerified] = useState(false);

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

        <div className="flex items-center justify-between gap-4">
          <CheckboxField name="rememberMe" label="Remember me" />
          <Link
            href="/forgot-password"
            className="shrink-0 text-[12px] font-semibold text-brand-700 underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {next && <input type="hidden" name="next" value={next} />}

        <TurnstileWidget action="login" resetKey={state} onVerifiedChange={setVerified} />

        <SubmitButton
          pending={isPending}
          pendingLabel="Signing in…"
          disabled={!verified}
          aria-describedby={verified ? undefined : "signin-verify-hint"}
        >
          Sign in
        </SubmitButton>
        {!verified && (
          <p id="signin-verify-hint" className="text-center text-[13px] text-ink-500">
            Complete the security check to sign in.
          </p>
        )}
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
