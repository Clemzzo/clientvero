import { compareMessages, type ThreadMessage } from "@/features/messages/thread-message";

export function mergeMessages(
  current: ThreadMessage[],
  incoming: ThreadMessage[],
  removedIds: readonly string[] = [],
): ThreadMessage[] {
  const removed = new Set(removedIds);
  const byId = new Map<string, ThreadMessage>();

  for (const message of [...current, ...incoming]) {
    if (!removed.has(message.id)) byId.set(message.id, message);
  }

  return [...byId.values()].sort(compareMessages);
}

export function markSeen(messages: ThreadMessage[], side: ThreadMessage["side"], seenUpTo: string | null): ThreadMessage[] {
  if (!seenUpTo) return messages;

  return messages.map((message) =>
    message.side === side && !message.isRead && message.sentAt <= seenUpTo ? { ...message, isRead: true } : message,
  );
}
