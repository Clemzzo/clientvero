import { FileText, FolderKanban, History, LayoutDashboard, UserPlus, Users, type LucideIcon } from "lucide-react";

export type AppNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const appNavigation: AppNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Leads", href: "/dashboard/leads", icon: UserPlus },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Proposals", href: "/dashboard/proposals", icon: FileText },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Activity", href: "/dashboard/activity", icon: History },
];
