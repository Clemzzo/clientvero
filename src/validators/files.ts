import { z } from "zod";

import { allowedTypesLabel, fileTypeForName, MAX_FILE_BYTES } from "@/features/files/file-types";
import { pageNumber, searchQuery } from "@/validators/fields";

export const FILES_PAGE_SIZE = 20;

export const fileIdSchema = z.uuid();

export const fileNameSchema = z
  .string()
  .trim()
  .min(1, "The file needs a name.")
  .max(255, "Rename the file to 255 characters or fewer.")
  .refine((name) => !/[/\\\u0000-\u001f\u007f]/.test(name), "The file name has characters we can't store.")
  .refine((name) => fileTypeForName(name) !== null, `Upload ${allowedTypesLabel} files.`);

export const fileSizeSchema = z
  .number()
  .int()
  .min(1, "This file is empty.")
  .max(MAX_FILE_BYTES, `Files can be up to ${MAX_FILE_BYTES / (1024 * 1024)} MB.`);

export const prepareUploadSchema = z.object({
  projectId: z.uuid(),
  name: fileNameSchema,
  sizeBytes: fileSizeSchema,
});

export type PrepareUploadInput = z.infer<typeof prepareUploadSchema>;

export const completeUploadSchema = prepareUploadSchema.extend({
  objectKey: z.string().min(1).max(200),
  shared: z.boolean(),
});

export type CompleteUploadInput = z.infer<typeof completeUploadSchema>;

export const fileListQuerySchema = z.object({
  q: searchQuery,
  page: pageNumber,
});

export type FileListQuery = z.infer<typeof fileListQuerySchema>;
