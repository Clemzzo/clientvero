"use client";

import { startTransition, useActionState, type SubmitEvent } from "react";
import { Info } from "lucide-react";

import { useSavedNotice } from "@/components/settings/use-saved-notice";
import { FormAlert } from "@/components/shared/FormAlert";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { notificationPreferenceGroups, type NotificationPreferences } from "@/features/settings/notification-preferences";
import { updateNotificationPreferencesAction } from "@/server/actions/settings";

export function NotificationPreferencesForm({ preferences }: { preferences: NotificationPreferences }) {
  const [state, submit, isPending] = useActionState(updateNotificationPreferencesAction, null);
  useSavedNotice(state, "Notification preferences saved.");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => submit(formData));
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={isPending} className="space-y-5">
        {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}

        <Card>
          {notificationPreferenceGroups.map((group) => (
            <section key={group.title} className="border-b border-ink-200 px-5 py-5 last:border-b-0 sm:px-6">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-500">{group.title}</h3>
              <ul className="mt-3 space-y-4">
                {group.rows.map((row) => {
                  const labelId = `pref-${row.type}`;
                  return (
                    <li key={row.type} className="flex items-start justify-between gap-6">
                      <div className="min-w-0">
                        <p id={labelId} className="text-[14px] font-semibold text-ink-900">
                          {row.title}
                        </p>
                        <p id={`${labelId}-hint`} className="mt-0.5 text-[13px] text-ink-500">
                          {row.description}
                        </p>
                      </div>
                      <Switch
                        name={row.type}
                        defaultChecked={preferences[row.type]}
                        aria-labelledby={labelId}
                        aria-describedby={`${labelId}-hint`}
                        className="mt-0.5"
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-[13px] text-ink-500">
            <Info aria-hidden className="size-4 shrink-0" />
            These are in-app notifications. Email notifications arrive in a later update.
          </p>
          <SubmitButton pending={isPending} pendingLabel="Saving…" className="mt-0 h-11 rounded-lg sm:w-44">
            Save preferences
          </SubmitButton>
        </div>
      </fieldset>
    </form>
  );
}
