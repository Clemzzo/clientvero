import { z } from "zod";

export const noticeKeys = [
  "lead-created",
  "client-created",
  "lead-converted",
  "proposal-created",
  "proposal-saved",
  "project-created",
  "project-saved",
] as const;

export type NoticeKey = (typeof noticeKeys)[number];

export const noticeSchema = z.enum(noticeKeys).optional().catch(undefined);
