import { Bell, Building2, CreditCard, UserRound, Users, type LucideIcon } from "lucide-react";

export type SettingsSectionKey = "profile" | "business" | "team" | "notifications" | "billing";

export type SettingsNavItem = {
  key: SettingsSectionKey;
  label: string;
  href: string;
  icon: LucideIcon;
};

export const SETTINGS_PATH = "/dashboard/settings";

export const settingsNavigation: SettingsNavItem[] = [
  { key: "profile", label: "Profile", href: `${SETTINGS_PATH}/profile`, icon: UserRound },
  { key: "business", label: "Business", href: `${SETTINGS_PATH}/business`, icon: Building2 },
  { key: "team", label: "Team", href: `${SETTINGS_PATH}/team`, icon: Users },
  { key: "notifications", label: "Notifications", href: `${SETTINGS_PATH}/notifications`, icon: Bell },
  { key: "billing", label: "Billing", href: `${SETTINGS_PATH}/billing`, icon: CreditCard },
];

export function visibleSettingsItems(sections: SettingsSectionKey[]): SettingsNavItem[] {
  return settingsNavigation.filter((item) => sections.includes(item.key));
}
