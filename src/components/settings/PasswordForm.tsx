"use client";

import { startTransition, useActionState, useEffect, useRef, type SubmitEvent } from "react";

import { PasswordField } from "@/components/auth/PasswordField";
import { useSavedNotice } from "@/components/settings/use-saved-notice";
import { CheckboxField } from "@/components/shared/CheckboxField";
import { FormAlert } from "@/components/shared/FormAlert";
import { FormSection } from "@/components/shared/FormSection";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { Card } from "@/components/ui/card";
import { changePasswordAction } from "@/server/actions/settings";

export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, submit, isPending] = useActionState(changePasswordAction, null);
  const errorFor = (field: string) => state?.fieldErrors?.[field]?.[0];
  useSavedNotice(state, "Password changed.");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => submit(formData));
  }

  useEffect(() => {
    if (state?.saved) formRef.current?.reset();
  }, [state]);

  return (
    <Card>
      <form ref={formRef} onSubmit={handleSubmit}>
        <fieldset disabled={isPending}>
          <FormSection title="Password" description="Use at least 8 characters. You'll stay signed in on this device.">
            {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}
            <PasswordField
              name="currentPassword"
              label="Current password"
              autoComplete="current-password"
              required
              error={errorFor("currentPassword")}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <PasswordField
                name="newPassword"
                label="New password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                error={errorFor("newPassword")}
              />
              <PasswordField
                name="confirmPassword"
                label="Confirm new password"
                autoComplete="new-password"
                required
                error={errorFor("confirmPassword")}
              />
            </div>
            <CheckboxField
              name="revokeOtherSessions"
              label="Sign out of other devices"
              hint="Recommended if you think someone else knows your password."
              defaultChecked
            />
            <div className="flex justify-end">
              <SubmitButton pending={isPending} pendingLabel="Updating…" className="mt-0 h-11 rounded-lg sm:w-44">
                Update password
              </SubmitButton>
            </div>
          </FormSection>
        </fieldset>
      </form>
    </Card>
  );
}
