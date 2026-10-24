"use client";

import { startTransition, useActionState, type SubmitEvent } from "react";
import { Lock } from "lucide-react";

import { ImageUploader } from "@/components/settings/ImageUploader";
import { useSavedNotice } from "@/components/settings/use-saved-notice";
import { FormAlert } from "@/components/shared/FormAlert";
import { FormSection } from "@/components/shared/FormSection";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { TextField } from "@/components/shared/TextField";
import { Card } from "@/components/ui/card";
import { updateProfileAction } from "@/server/actions/settings";

type ProfileFormProps = {
  firstName: string | null;
  lastName: string | null;
  email: string;
  displayName: string;
  avatarSrc: string | null;
};

export function ProfileForm({ firstName, lastName, email, displayName, avatarSrc }: ProfileFormProps) {
  const [state, submit, isPending] = useActionState(updateProfileAction, null);
  const errorFor = (field: string) => state?.fieldErrors?.[field]?.[0];
  useSavedNotice(state, "Profile saved.");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => submit(formData));
  }

  return (
    <Card>
      <FormSection title="Photo" description="Shown to your team in menus and team lists.">
        <ImageUploader target="avatar" name={displayName} src={avatarSrc} label="Profile photo" />
      </FormSection>

      <form onSubmit={handleSubmit}>
        <fieldset disabled={isPending}>
          <FormSection title="Your details" description="How your name appears across the workspace.">
            {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                name="firstName"
                label="First name"
                autoComplete="given-name"
                maxLength={120}
                defaultValue={firstName ?? ""}
                error={errorFor("firstName")}
              />
              <TextField
                name="lastName"
                label="Last name"
                autoComplete="family-name"
                maxLength={120}
                defaultValue={lastName ?? ""}
                error={errorFor("lastName")}
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-[14px] font-medium text-ink-900">Email</p>
              <div className="flex h-11 items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 px-3.5 text-[14px] text-ink-700">
                <Lock aria-hidden className="size-4 shrink-0 text-ink-400" />
                <span className="truncate">{email}</span>
              </div>
              <p className="text-[13px] text-ink-500">This is the email you sign in with. It can&apos;t be changed here.</p>
            </div>
            <div className="flex justify-end">
              <SubmitButton pending={isPending} pendingLabel="Saving…" className="mt-0 h-11 rounded-lg sm:w-40">
                Save changes
              </SubmitButton>
            </div>
          </FormSection>
        </fieldset>
      </form>
    </Card>
  );
}
