import Link from "next/link";
import { Bell } from "lucide-react";

import { UnreadBadge } from "@/components/shared/UnreadBadge";

type NotificationBellProps = {
  unread: number;
};

export function NotificationBell({ unread }: NotificationBellProps) {
  const label = unread === 0 ? "Notifications" : `Notifications, ${unread} unread`;

  return (
    <Link
      href="/dashboard/notifications"
      aria-label={label}
      title={label}
      className="relative grid size-10 place-items-center rounded-xl text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <Bell aria-hidden className="size-5" />
      <UnreadBadge count={unread} className="absolute -top-0.5 -right-0.5 h-4.5 min-w-4.5 px-1 text-[10.5px]" />
    </Link>
  );
}
