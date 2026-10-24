import "server-only";

import { settingsNavigation, type SettingsSectionKey } from "@/components/settings/settings-navigation";
import type { OrganizationRole } from "@/db/schema";
import { hasPermission, permissions } from "@/server/authorization/permissions";

export function settingsSectionsFor(role: OrganizationRole): SettingsSectionKey[] {
  return settingsNavigation
    .filter((item) => item.key !== "billing" || hasPermission(role, permissions.billingRead))
    .map((item) => item.key);
}
