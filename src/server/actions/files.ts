"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { workspaceLimits } from "@/lib/redis/rate-limit";
import { toActionError } from "@/server/actions/action-error";
import { requireWithinLimit } from "@/server/actions/rate-limit-guard";
import { requireOrganizationContext } from "@/server/auth/organization";
import { permissions, requirePermission } from "@/server/authorization/permissions";
import {
  completeProjectUpload,
  deleteFile,
  prepareProjectUpload,
  setFileShared,
  type PreparedUpload,
} from "@/server/services/file.service";
import { completeUploadSchema, fileIdSchema, prepareUploadSchema } from "@/validators/files";

const fileMissing = "This file no longer exists.";
const uploadErrorOptions = { scope: "files", notFound: "This project no longer exists." };
const fileErrorOptions = { scope: "files", notFound: fileMissing };

type ActionResult = { error?: string };

async function requireFileWriter(limit = workspaceLimits.writesPerUser) {
  const ctx = await requireOrganizationContext();
  requirePermission(ctx, permissions.projectsUpdate);
  await requireWithinLimit(ctx, limit);
  return ctx;
}

function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "This file can't be uploaded.";
}

export async function prepareFileUploadAction(input: unknown): Promise<{ error: string } | PreparedUpload> {
  try {
    const ctx = await requireFileWriter(workspaceLimits.uploadsPerUser);

    const parsed = prepareUploadSchema.safeParse(input);
    if (!parsed.success) {
      return { error: firstIssue(parsed.error) };
    }

    return await prepareProjectUpload(ctx, parsed.data);
  } catch (error) {
    return { error: toActionError(error, uploadErrorOptions) };
  }
}

export async function completeFileUploadAction(input: unknown): Promise<ActionResult> {
  try {
    const ctx = await requireFileWriter(workspaceLimits.uploadsPerUser);

    const parsed = completeUploadSchema.safeParse(input);
    if (!parsed.success) {
      return { error: firstIssue(parsed.error) };
    }

    await completeProjectUpload(ctx, parsed.data);
  } catch (error) {
    return { error: toActionError(error, uploadErrorOptions) };
  }

  revalidatePath("/dashboard", "layout");
  return {};
}

export async function setFileSharedAction(id: string, shared: boolean): Promise<ActionResult> {
  const fileId = fileIdSchema.safeParse(id);
  const nextShared = z.boolean().safeParse(shared);

  if (!fileId.success || !nextShared.success) {
    return { error: fileMissing };
  }

  try {
    const ctx = await requireFileWriter();
    await setFileShared(ctx, fileId.data, nextShared.data);
  } catch (error) {
    return { error: toActionError(error, fileErrorOptions) };
  }

  revalidatePath("/dashboard", "layout");
  return {};
}

export async function deleteFileAction(id: string): Promise<ActionResult> {
  const fileId = fileIdSchema.safeParse(id);

  if (!fileId.success) {
    return { error: fileMissing };
  }

  try {
    const ctx = await requireFileWriter();
    await deleteFile(ctx, fileId.data);
  } catch (error) {
    return { error: toActionError(error, fileErrorOptions) };
  }

  revalidatePath("/dashboard", "layout");
  return {};
}
