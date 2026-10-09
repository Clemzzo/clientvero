import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  NoSuchKey,
  NotFound,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/lib/env";

const UPLOAD_URL_SECONDS = 300;
const DOWNLOAD_URL_SECONDS = 60;

const s3 = new S3Client({
  forcePathStyle: true,
  region: env.AWS_REGION,
  endpoint: env.AWS_ENDPOINT_URL_S3,
  credentials: { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY },
});

const bucket = env.STORAGE_BUCKET_NAME;

export type StoredObject = { sizeBytes: number; contentType: string | null };

export type UploadTarget = { url: string; headers: Record<string, string> };

export type ObjectStream = { body: ReadableStream; sizeBytes: number };

export function contentDisposition(type: "attachment" | "inline", fileName: string): string {
  const fallback = fileName.replace(/[^\x20-\x7e]|["\\]/g, "_");
  return `${type}; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export async function createUploadUrl(
  objectKey: string,
  file: { name: string; contentType: string; sizeBytes: number },
): Promise<UploadTarget> {
  const headers = { "Content-Type": file.contentType, "Content-Disposition": contentDisposition("attachment", file.name) };

  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ContentType: headers["Content-Type"],
      ContentDisposition: headers["Content-Disposition"],
      ContentLength: file.sizeBytes,
    }),
    { expiresIn: UPLOAD_URL_SECONDS, signableHeaders: new Set(["content-type", "content-disposition", "content-length"]) },
  );

  return { url, headers };
}

export function createDownloadUrl(objectKey: string): Promise<string> {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: objectKey }), { expiresIn: DOWNLOAD_URL_SECONDS });
}

export async function openObject(objectKey: string): Promise<ObjectStream | null> {
  try {
    const result = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: objectKey }));
    if (!result.Body) return null;
    return { body: result.Body.transformToWebStream(), sizeBytes: result.ContentLength ?? 0 };
  } catch (error) {
    if (error instanceof NoSuchKey) return null;
    throw error;
  }
}

export async function headObject(objectKey: string): Promise<StoredObject | null> {
  try {
    const result = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: objectKey }));
    return { sizeBytes: result.ContentLength ?? 0, contentType: result.ContentType ?? null };
  } catch (error) {
    if (error instanceof NotFound) return null;
    throw error;
  }
}

export async function deleteObject(objectKey: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey }));
}
