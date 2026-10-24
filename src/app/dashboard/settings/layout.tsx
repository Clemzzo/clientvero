import type { ReactNode } from "react";

import { SettingsNav } from "@/components/settings/SettingsNav";
import { PageHeader } from "@/components/shared/PageHeader";
import { requireOrganizationContext } from "@/server/auth/organization";
import { settingsSectionsFor } from "@/server/authorization/settings-sections";

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  const ctx = await requireOrganizationContext();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 lg:py-10">
      <PageHeader title="Settings" description="Manage your profile, your business and the people you work with." />
      <div className="mt-6 space-y-6 lg:mt-8">
        <SettingsNav sections={settingsSectionsFor(ctx.membership.role)} />
        {children}
      </div>
    </div>
  );
}
