import "server-only";

import type { WorkspaceActor } from "@/server/auth/organization";
import { unreadSummary, type UnreadSummary } from "@/server/repositories/message.repository";
import { notificationSummary, type NotificationSummary } from "@/server/services/notification.service";

export type ShellSummary = {
  messages: UnreadSummary;
  notifications: NotificationSummary;
};

export async function getShellSummary(actor: WorkspaceActor): Promise<ShellSummary> {
  const [messages, notifications] = await Promise.all([
    unreadSummary(actor.organization.id, "team"),
    notificationSummary(actor),
  ]);

  return { messages, notifications };
}
