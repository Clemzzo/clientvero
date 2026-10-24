import "server-only";

import { imageMimeTypeForName, type ImageTarget } from "@/features/settings/image-types";
import { createUploadUrl, deleteObject, headObject } from "@/lib/storage/client";
import { buildAvatarKey, buildLogoKey, isAvatarKey, isLogoKey } from "@/lib/storage/object-key";
import type { WorkspaceActor } from "@/server/auth/organization";
import { ValidationError } from "@/server/errors";
import type { PreparedUpload } from "@/server/services/file.service";
import { setLogoKey } from "@/server/services/organization.service";
import { setAvatarKey } from "@/server/services/user.service";
import type { CompleteImageUploadInput, PrepareImageUploadInput } from "@/validators/settings";

const uploadFailed = "The upload didn't finish. Try uploading the image again.";

function contentTypeFor(name: string): string {
  const mimeType = imageMimeTypeForName(name);

  if (!mimeType) {
    throw new ValidationError("Upload a PNG or JPG image.");
  }

  return mimeType;
}

function currentKey(ctx: WorkspaceActor, target: ImageTarget): string | null {
  return target === "logo" ? ctx.organization.logoKey : ctx.user.avatarKey;
}

function ownsKey(ctx: WorkspaceActor, target: ImageTarget, key: string): boolean {
  return target === "logo" ? isLogoKey(key, ctx.organization.id) : isAvatarKey(key, ctx.organization.id, ctx.user.id);
}

function saveKey(ctx: WorkspaceActor, target: ImageTarget, key: string | null): Promise<void> {
  return target === "logo" ? setLogoKey(ctx.organization.id, key) : setAvatarKey(ctx.user.id, key);
}

async function discardObject(key: string | null) {
  if (!key) return;

  try {
    await deleteObject(key);
  } catch (error) {
    console.error("[settings] removing old image failed", error instanceof Error ? error.message : error);
  }
}

export async function prepareImageUpload(ctx: WorkspaceActor, input: PrepareImageUploadInput): Promise<PreparedUpload> {
  const objectKey = input.target === "logo" ? buildLogoKey(ctx.organization.id) : buildAvatarKey(ctx.organization.id, ctx.user.id);
  const target = await createUploadUrl(objectKey, {
    name: input.name,
    contentType: contentTypeFor(input.name),
    sizeBytes: input.sizeBytes,
  });

  return { ...target, objectKey };
}

export async function completeImageUpload(ctx: WorkspaceActor, input: CompleteImageUploadInput): Promise<void> {
  if (!ownsKey(ctx, input.target, input.objectKey)) {
    throw new ValidationError(uploadFailed);
  }

  const previous = currentKey(ctx, input.target);

  if (previous === input.objectKey) {
    return;
  }

  const stored = await headObject(input.objectKey);

  if (!stored) {
    throw new ValidationError(uploadFailed);
  }

  if (stored.sizeBytes !== input.sizeBytes || stored.contentType !== contentTypeFor(input.name)) {
    await discardObject(input.objectKey);
    throw new ValidationError(uploadFailed);
  }

  await saveKey(ctx, input.target, input.objectKey);
  await discardObject(previous);
}

export async function removeImage(ctx: WorkspaceActor, target: ImageTarget): Promise<void> {
  const previous = currentKey(ctx, target);

  if (!previous) {
    return;
  }

  await saveKey(ctx, target, null);
  await discardObject(previous);
}
