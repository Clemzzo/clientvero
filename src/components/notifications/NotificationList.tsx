import { Banknote, Bell, Eye, FileCheck2, FileX2, MessageSquare, type LucideIcon } from "lucide-react";

import { IconTile } from "@/components/shared/IconTile";
import { isEmittedNotificationType, notificationTones, type EmittedNotificationType } from "@/features/notifications/notification-types";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/format";
import type { NotificationRow } from "@/server/services/notification.service";

const icons: Record<EmittedNotificationType, LucideIcon> = {
  PROPOSAL_ACCEPTED: FileCheck2,
  PROPOSAL_DECLINED: FileX2,
  INVOICE_VIEWED: Eye,
  PAYMENT_RECEIVED: Banknote,
  MESSAGE_RECEIVED: MessageSquare,
};

function NotificationIcon({ type }: { type: string }) {
  const known = isEmittedNotificationType(type);
  const Icon = known ? icons[type] : Bell;

  return <IconTile icon={<Icon />} tone={known ? notificationTones[type] : "brand"} size="sm" />;
}

export function NotificationList({ notifications }: { notifications: NotificationRow[] }) {
  const now = new Date();

  return (
    <ul>
      {notifications.map((notification) => (
        <li key={notification.id} className="border-b border-ink-200 last:border-b-0">
          <a
            href={`/dashboard/notifications/${notification.id}/open`}
            className={cn(
              "flex items-start gap-3 px-5 py-4 transition-colors hover:bg-ink-50 focus-visible:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 sm:px-6",
              !notification.isRead && "bg-brand-50/40",
            )}
          >
            <NotificationIcon type={notification.type} />
            <div className="min-w-0 flex-1">
              <p className={cn("text-[14px] leading-snug text-ink-900", notification.isRead ? "font-medium" : "font-semibold")}>
                {notification.title}
                {!notification.isRead && <span className="sr-only"> (unread)</span>}
              </p>
              <p className="mt-0.5 text-[13.5px] leading-snug text-ink-500">{notification.message}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 pt-px">
              <time dateTime={notification.createdAt.toISOString()} className="text-[12.5px] text-ink-500 tabular-nums">
                {formatRelativeTime(notification.createdAt, now)}
              </time>
              {!notification.isRead && <span aria-hidden className="size-2 rounded-full bg-brand-600" />}
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
