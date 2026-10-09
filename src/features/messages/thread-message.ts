export const MESSAGE_MAX_LENGTH = 5000;
export const MESSAGE_COUNTER_FROM = 4500;
export const MESSAGES_PAGE_SIZE = 50;
export const THREAD_POLL_MS = 3000;
export const INBOX_POLL_MS = 15000;

export type MessageSide = "team" | "client";

export type ThreadMessage = {
  id: string;
  sentAt: string;
  content: string;
  side: MessageSide;
  mine: boolean;
  senderName: string;
  isRead: boolean;
};

export function sentAtDate(sentAt: string): Date {
  return new Date(`${sentAt.slice(0, 23)}Z`);
}

export function compareMessages(a: Pick<ThreadMessage, "sentAt" | "id">, b: Pick<ThreadMessage, "sentAt" | "id">): number {
  if (a.sentAt !== b.sentAt) return a.sentAt < b.sentAt ? -1 : 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}
