import { sentAtDate, type MessageSide, type ThreadMessage } from "@/features/messages/thread-message";

const GROUP_GAP_MS = 5 * 60 * 1000;

export type MessageGroup<Message extends ThreadMessage = ThreadMessage> = {
  key: string;
  side: MessageSide;
  senderName: string;
  messages: Message[];
};

export type DaySection<Message extends ThreadMessage = ThreadMessage> = {
  key: string;
  date: Date;
  groups: MessageGroup<Message>[];
};

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function startsNewGroup(previous: ThreadMessage, next: ThreadMessage) {
  return (
    previous.side !== next.side ||
    previous.senderName !== next.senderName ||
    sentAtDate(next.sentAt).getTime() - sentAtDate(previous.sentAt).getTime() > GROUP_GAP_MS
  );
}

export function groupMessages<Message extends ThreadMessage>(messages: Message[]): DaySection<Message>[] {
  const sections: DaySection<Message>[] = [];

  for (const message of messages) {
    const date = sentAtDate(message.sentAt);
    let section = sections.at(-1);

    if (!section || section.key !== dayKey(date)) {
      section = { key: dayKey(date), date, groups: [] };
      sections.push(section);
    }

    const group = section.groups.at(-1);
    const last = group?.messages.at(-1);

    if (group && last && !startsNewGroup(last, message)) {
      group.messages.push(message);
    } else {
      section.groups.push({ key: message.id, side: message.side, senderName: message.senderName, messages: [message] });
    }
  }

  return sections;
}

export function latestSeenId(messages: ThreadMessage[], side: MessageSide): string | null {
  const latest = messages.findLast((message) => message.side === side);
  return latest?.isRead ? latest.id : null;
}

const weekdayDate = new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric", month: "short" });
const fullDate = new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export function dayLabel(date: Date, now = new Date()): string {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - day.getTime()) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.getFullYear() === now.getFullYear() ? weekdayDate.format(date) : fullDate.format(date);
}
