import type { Metadata } from "next";

import { NotificationPreferencesForm } from "@/components/settings/NotificationPreferencesForm";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { requireOrganizationContext } from "@/server/auth/organization";
import { getNotificationPreferences } from "@/server/services/notification.service";

export const metadata: Metadata = {
  title: "Notification settings",
};

export default async function NotificationSettingsPage() {
  const ctx = await requireOrganizationContext();

  return (
    <div className="space-y-6">
      <SettingsHeader title="Notifications" description="Choose what shows up in your notification bell. These settings only affect you." />
      <NotificationPreferencesForm preferences={getNotificationPreferences(ctx)} />
    </div>
  );
}
