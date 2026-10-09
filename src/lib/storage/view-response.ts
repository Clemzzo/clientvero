import "server-only";

import { isViewableMimeType } from "@/features/files/file-types";
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
