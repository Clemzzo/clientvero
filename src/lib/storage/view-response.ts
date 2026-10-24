import "server-only";

import { isViewableMimeType } from "@/features/files/file-types";
import { isImageMimeType } from "@/features/settings/image-types";
import { contentDisposition, openObject } from "@/lib/storage/client";
import type { FileObject } from "@/server/repositories/file.repository";

const imagePolicy = "sandbox; default-src 'none'; img-src 'self'; style-src 'unsafe-inline'";

export function notFoundResponse(): Response {
  return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
}

export async function inlineFileResponse(file: FileObject): Promise<Response> {
  if (!isViewableMimeType(file.mimeType)) {
    return notFoundResponse();
  }

  const object = await openObject(file.objectKey);

  if (!object) {
    return notFoundResponse();
  }

  const headers = new Headers({
    "Content-Type": file.mimeType,
    "Content-Length": String(object.sizeBytes),
    "Content-Disposition": contentDisposition("inline", file.name),
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "Cross-Origin-Resource-Policy": "same-origin",
  });

  if (file.mimeType.startsWith("image/")) {
    headers.set("Content-Security-Policy", imagePolicy);
  }

  return new Response(object.body, { status: 200, headers });
}

type ImageCache = "public" | "private";

const imageCacheControl: Record<ImageCache, string> = {
  public: "public, max-age=31536000, immutable",
  private: "private, max-age=31536000, immutable",
};

export async function imageResponse(objectKey: string, cache: ImageCache): Promise<Response> {
  const object = await openObject(objectKey);

  if (!object || !isImageMimeType(object.contentType)) {
    return notFoundResponse();
  }

  return new Response(object.body, {
    status: 200,
    headers: {
      "Content-Type": object.contentType,
      "Content-Length": String(object.sizeBytes),
      "Cache-Control": imageCacheControl[cache],
      "Content-Security-Policy": imagePolicy,
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  });
}
