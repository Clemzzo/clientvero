import { z } from "zod";

import { pageNumber } from "@/validators/fields";

export const NOTIFICATION_PAGE_SIZE = 25;

export const notificationFilters = ["all", "unread"] as const;

export type NotificationFilter = (typeof notificationFilters)[number];

export const notificationListQuerySchema = z.object({
  filter: z.enum(notificationFilters).catch("all"),
  page: pageNumber,
});

export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;

export const notificationIdSchema = z.uuid();
