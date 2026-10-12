import { FolderKanban, LayoutDashboard, MessagesSquare, ReceiptText, type LucideIcon } from "lucide-react";

export type PortalNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: "messages";
};

export function portalNavigation(slug: string): PortalNavItem[] {
  return [
    { label: "Overview", href: `/portal/${slug}`, icon: LayoutDashboard, exact: true },
    { label: "Projects", href: `/portal/${slug}/projects`, icon: FolderKanban },
    { label: "Invoices", href: `/portal/${slug}/invoices`, icon: ReceiptText },
    { label: "Messages", href: `/portal/${slug}/messages`, icon: MessagesSquare, badge: "messages" },
  ];
}
