import "server-only";

import { and, count, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { files, projects, type StoredFile } from "@/db/schema";
import { activityActions, activityResources } from "@/features/activity/activity-actions";
import { fileTypeForName, MAX_FILES_PER_PROJECT } from "@/features/files/file-types";
import { createUploadUrl, deleteObject, headObject, type UploadTarget } from "@/lib/storage/client";
import { buildObjectKey, isProjectObjectKey } from "@/lib/storage/object-key";
import type { WorkspaceActor } from "@/server/auth/organization";
import { NotFoundError, ValidationError } from "@/server/errors";
import { activityInsertIf } from "@/server/services/activity.service";
import { projectActivity, requireProject } from "@/server/services/project.service";
import type { CompleteUploadInput, PrepareUploadInput } from "@/validators/files";

export type PreparedUpload = UploadTarget & { objectKey: string };

const fileMissing = "This file no longer exists.";
const uploadFailed = "The upload didn't finish. Try uploading the file again.";

function fileScope(organizationId: string, fileId: string) {
  return and(eq(files.id, fileId), eq(files.organizationId, organizationId));
}

function contentTypeFor(name: string): string {
  const type = fileTypeForName(name);

  if (!type) {
    throw new ValidationError("This file type isn't supported.");
  }

  return type.mimeType;
}

async function requireRoomForFile(organizationId: string, projectId: string) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(files)
    .where(and(eq(files.organizationId, organizationId), eq(files.projectId, projectId)));

  if (total >= MAX_FILES_PER_PROJECT) {
    throw new ValidationError(`A project can have up to ${MAX_FILES_PER_PROJECT} files. Delete some to upload more.`);
  }
}

export async function prepareProjectUpload(ctx: WorkspaceActor, input: PrepareUploadInput): Promise<PreparedUpload> {
  const organizationId = ctx.organization.id;
  await requireProject(organizationId, input.projectId);
  await requireRoomForFile(organizationId, input.projectId);

  const objectKey = buildObjectKey(organizationId, input.projectId);
  const target = await createUploadUrl(objectKey, {
    name: input.name,
    contentType: contentTypeFor(input.name),
    sizeBytes: input.sizeBytes,
  });

  return { ...target, objectKey };
}

export async function completeProjectUpload(ctx: WorkspaceActor, input: CompleteUploadInput): Promise<void> {
  const organizationId = ctx.organization.id;
  const project = await requireProject(organizationId, input.projectId);

  if (!isProjectObjectKey(input.objectKey, organizationId, project.id)) {
    throw new ValidationError(uploadFailed);
  }

  const [existing] = await db
    .select({ id: files.id })
    .from(files)
    .where(and(eq(files.organizationId, organizationId), eq(files.objectKey, input.objectKey)))
    .limit(1);

  if (existing) {
    return;
  }

  const contentType = contentTypeFor(input.name);
  const stored = await headObject(input.objectKey);

  if (!stored) {
    throw new ValidationError(uploadFailed);
  }

  if (stored.sizeBytes !== input.sizeBytes || stored.contentType !== contentType) {
    await deleteObject(input.objectKey);
    throw new ValidationError(uploadFailed);
  }

  await requireRoomForFile(organizationId, project.id);

  await db.batch([
    db
      .insert(files)
      .values({
        organizationId,
        clientId: project.clientId,
        projectId: project.id,
        uploadedBy: ctx.user.id,
        name: input.name,
        objectKey: input.objectKey,
        mimeType: contentType,
        sizeBytes: stored.sizeBytes,
        isPublic: input.shared,
      })
      .onConflictDoNothing({ target: files.objectKey }),
    activityInsertIf(
      {
        organizationId,
        actorUserId: ctx.user.id,
        action: activityActions.fileUploaded,
        resourceType: activityResources.project,
        resourceId: project.id,
        metadata: { name: project.name, fileName: input.name },
      },
      // created_at = now() only matches a row inserted by this batch's transaction, so a repeated completion logs nothing.
      sql`exists (select 1 from ${files} where ${files.objectKey} = ${input.objectKey} and ${files.createdAt} = now())`,
    ),
  ]);
}

async function requireFile(organizationId: string, fileId: string): Promise<StoredFile> {
  const [file] = await db
    .select({ file: files })
    .from(files)
    .innerJoin(projects, and(eq(projects.id, files.projectId), isNull(projects.deletedAt)))
    .where(fileScope(organizationId, fileId))
    .limit(1);

  if (!file) {
    throw new NotFoundError(fileMissing);
  }

  return file.file;
}

export function getFileForDownload(organizationId: string, fileId: string): Promise<StoredFile> {
  return requireFile(organizationId, fileId);
}

export async function setFileShared(ctx: WorkspaceActor, fileId: string, shared: boolean): Promise<void> {
  const organizationId = ctx.organization.id;
  const file = await requireFile(organizationId, fileId);

  if (file.isPublic === shared) {
    return;
  }

  const project = await requireProject(organizationId, file.projectId);

  await db.batch([
    db.update(files).set({ isPublic: shared }).where(fileScope(organizationId, fileId)),
    projectActivity(ctx, project.id, shared ? activityActions.fileShared : activityActions.fileUnshared, {
      name: project.name,
      fileName: file.name,
    }),
  ]);
}

export async function deleteFile(ctx: WorkspaceActor, fileId: string): Promise<void> {
  const organizationId = ctx.organization.id;
  const file = await requireFile(organizationId, fileId);
  const project = await requireProject(organizationId, file.projectId);

  await db.batch([
    db.delete(files).where(fileScope(organizationId, fileId)),
    projectActivity(ctx, project.id, activityActions.fileDeleted, { name: project.name, fileName: file.name }),
  ]);

  try {
    await deleteObject(file.objectKey);
  } catch (error) {
    console.error("[files] stored object could not be deleted", error instanceof Error ? error.message : error);
  }
}
