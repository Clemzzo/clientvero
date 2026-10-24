import type { Metadata } from "next";

import { PasswordForm } from "@/components/settings/PasswordForm";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { avatarSrc } from "@/features/settings/image-urls";
import { personName } from "@/lib/utils/format";
import { requireOrganizationContext } from "@/server/auth/organization";

export const metadata: Metadata = {
  title: "Profile settings",
};

export default async function ProfileSettingsPage() {
  const { user } = await requireOrganizationContext();

  return (
    <div className="space-y-6">
      <SettingsHeader title="Profile" description="Your personal details and how you sign in." />
      <ProfileForm
        firstName={user.firstName}
        lastName={user.lastName}
        email={user.email}
        displayName={personName(user)}
        avatarSrc={avatarSrc(user.id, user.avatarKey)}
      />
      <PasswordForm />
    </div>
  );
}
