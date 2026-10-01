"use client";

import { startTransition, useActionState, type SubmitEvent } from "react";
import Link from "next/link";

import { PasswordField } from "@/components/auth/PasswordField";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";
import { FormAlert } from "@/components/shared/FormAlert";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { TextField } from "@/components/shared/TextField";
import type { PlanId } from "@/features/subscriptions/plans";
import { signUpAction } from "@/server/actions/auth";

type SignUpFormProps = {
  plan: PlanId | undefined;
};

export function SignUpForm({ plan }: SignUpFormProps) {
  const [state, submit, isPending] = useActionState(signUpAction, null);

  function errorFor(field: "name" | "email" | "password") {
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
          name="name"
          label="Your name"
          autoComplete="name"
          required
          maxLength={120}
          error={errorFor("name")}
        />

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
          hint="At least 8 characters."
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          error={errorFor("password")}
        />

        {plan && <input type="hidden" name="plan" value={plan} />}

        <TurnstileWidget action="signup" resetKey={state} />

        <SubmitButton pending={isPending} pendingLabel="Creating account…">
          Create account
        </SubmitButton>
      </fieldset>

      <p className="mt-6 text-[14px] text-ink-500">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
