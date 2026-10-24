import {
  Banknote,
  FileText,
  FolderKanban,
  FolderOpen,
  History,
  LayoutDashboard,
  MessagesSquare,
  ReceiptText,
  Settings,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AppNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: "messages";
};

export const appNavigation: AppNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Leads", href: "/dashboard/leads", icon: UserPlus },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Proposals", href: "/dashboard/proposals", icon: FileText },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Invoices", href: "/dashboard/invoices", icon: ReceiptText },
  { label: "Payments", href: "/dashboard/payments", icon: Banknote },
  { label: "Messages", href: "/dashboard/messages", icon: MessagesSquare, badge: "messages" },
  { label: "Files", href: "/dashboard/files", icon: FolderOpen },
  { label: "Activity", href: "/dashboard/activity", icon: History },
];

export const settingsNavItem: AppNavItem = { label: "Settings", href: "/dashboard/settings", icon: Settings };
