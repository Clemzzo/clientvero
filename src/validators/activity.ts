import { z } from "zod";

import { activityFilters } from "@/features/activity/activity-filters";
import { pageNumber } from "@/validators/fields";

export const ACTIVITY_PAGE_SIZE = 25;

export const activityListQuerySchema = z.object({
  resource: z.enum(activityFilters).catch("all"),
  page: pageNumber,
});

export type ActivityListQuery = z.infer<typeof activityListQuerySchema>;

export const activityIdSchema = z.uuid();
