import { z } from "zod";

import { isValidTimeZone } from "@/lib/utils/timezone";

export const timeZoneSchema = z.string().trim().min(1).max(100).refine(isValidTimeZone);
