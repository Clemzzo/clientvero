import "server-only";

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  NEXT_PUBLIC_APP_URL: z.url(),
  NEON_AUTH_BASE_URL: z.url(),
  NEON_AUTH_COOKIE_SECRET: z.string().min(32, "must be at least 32 characters"),
  UPSTASH_REDIS_REST_URL: z.url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
  TURNSTILE_SECRET: z.string().min(1),
  TURNSTILE_HOSTNAMES: z
    .string()
    .transform((value) => value.split(",").map((hostname) => hostname.trim()).filter(Boolean))
    .pipe(z.array(z.string()).min(1, "must list at least one hostname")),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues
    .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid environment variables. Check .env.local:\n${problems}`);
}

export const env = parsed.data;
