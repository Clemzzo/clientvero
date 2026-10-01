import { z } from "zod";

export const noticeKeys = ["lead-created", "client-created", "lead-converted"] as const;

export type NoticeKey = (typeof noticeKeys)[number];

export const noticeSchema = z.enum(noticeKeys).optional().catch(undefined);
