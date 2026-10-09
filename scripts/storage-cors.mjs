import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";

const origins = (process.env.STORAGE_CORS_ORIGINS ?? process.env.NEXT_PUBLIC_APP_URL ?? "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

if (origins.length === 0) {
  console.error("Set NEXT_PUBLIC_APP_URL (or STORAGE_CORS_ORIGINS, comma-separated) first.");
  process.exit(1);
}

const bucket = process.env.STORAGE_BUCKET_NAME || "files";
const s3 = new S3Client({ forcePathStyle: true });

await s3.send(
  new PutBucketCorsCommand({
    Bucket: bucket,
    CORSConfiguration: {
      CORSRules: [{ AllowedOrigins: origins, AllowedMethods: ["PUT"], AllowedHeaders: ["content-type", "content-disposition"], MaxAgeSeconds: 3600 }],
    },
  }),
);

console.log(`CORS set on bucket "${bucket}" for ${origins.join(", ")}`);
