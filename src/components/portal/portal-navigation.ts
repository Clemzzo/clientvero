import { FolderKanban, LayoutDashboard, type LucideIcon } from "lucide-react";

export type PortalNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export function portalNavigation(slug: string): PortalNavItem[] {
  return [
    { label: "Overview", href: `/portal/${slug}`, icon: LayoutDashboard, exact: true },
    { label: "Projects", href: `/portal/${slug}/projects`, icon: FolderKanban },
  ];
}
