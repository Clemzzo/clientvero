import { z } from "zod";

import { MESSAGE_MAX_LENGTH } from "@/features/messages/thread-message";
import { pageNumber, searchQuery } from "@/validators/fields";

export const INBOX_PAGE_SIZE = 20;

export const messageIdSchema = z.uuid();

export const messageContentSchema = z
  .string({ error: "Write a message first." })
  .trim()
  .min(1, "Write a message first.")
  .max(MESSAGE_MAX_LENGTH, `Messages can be up to ${MESSAGE_MAX_LENGTH.toLocaleString("en")} characters.`);

export const threadCursorSchema = z.iso.datetime({ precision: 6 });

export const sendMessageSchema = z.object({
  id: z.uuid(),
  projectId: z.uuid(),
  content: messageContentSchema,
  after: threadCursorSchema.nullable(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const pollThreadSchema = z.object({
  projectId: z.uuid(),
  after: threadCursorSchema.nullable(),
  knownIds: z.array(z.uuid()).max(100),
});

export type PollThreadInput = z.infer<typeof pollThreadSchema>;

export const earlierMessagesSchema = z.object({
  projectId: z.uuid(),
  before: threadCursorSchema,
});

export const inboxFilters = ["all", "unread"] as const;
export type InboxFilter = (typeof inboxFilters)[number];

export const inboxQuerySchema = z.object({
  q: searchQuery,
  page: pageNumber,
  filter: z.enum(inboxFilters).catch("all").default("all"),
});

export type InboxQuery = z.infer<typeof inboxQuerySchema>;
