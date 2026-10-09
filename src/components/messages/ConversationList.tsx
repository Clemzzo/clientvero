import Link from "next/link";

import { Avatar } from "@/components/shared/Avatar";
import { UnreadBadge } from "@/components/shared/UnreadBadge";
import type { MessageSide } from "@/features/messages/thread-message";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/format";
import type { ConversationRow } from "@/server/repositories/message.repository";

type ConversationListProps = {
  conversations: ConversationRow[];
  viewerSide: MessageSide;
  hrefFor: (projectId: string) => string;
  activeProjectId?: string;
  className?: string;
};

export function ConversationList({ conversations, viewerSide, hrefFor, activeProjectId, className }: ConversationListProps) {
  return (
    <ul className={cn("divide-y divide-ink-200", className)}>
      {conversations.map((conversation) => {
        const active = conversation.projectId === activeProjectId;
        const unread = conversation.unread > 0;
        const title = viewerSide === "team" ? conversation.clientName : conversation.projectName;
        const subtitle = viewerSide === "team" ? conversation.projectName : null;
        const fromViewer = conversation.lastSide === viewerSide;

        return (
          <li key={conversation.projectId}>
            <Link
              href={hrefFor(conversation.projectId)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex gap-3 px-4 py-3.5 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600",
                active ? "bg-brand-50" : "hover:bg-ink-50",
              )}
            >
              <Avatar name={title} className="mt-0.5 size-9 text-[12.5px]" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className={cn("truncate text-[14px] text-ink-900", unread ? "font-bold" : "font-semibold")}>{title}</p>
                  <time
                    dateTime={conversation.lastAt.toISOString()}
                    className={cn("shrink-0 text-[12px]", unread ? "font-semibold text-ink-900" : "text-ink-500")}
                  >
                    {formatRelativeTime(conversation.lastAt)}
                  </time>
                </div>
                {subtitle && <p className="truncate text-[13px] text-ink-500">{subtitle}</p>}
                <div className="mt-0.5 flex items-center justify-between gap-3">
                  <p className={cn("truncate text-[13px]", unread ? "font-medium text-ink-900" : "text-ink-500")}>
                    {fromViewer && <span className="text-ink-500">You: </span>}
                    {conversation.preview}
                  </p>
                  <UnreadBadge count={conversation.unread} />
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
