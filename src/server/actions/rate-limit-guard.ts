import "server-only";

import type { Ratelimit } from "@upstash/ratelimit";

import { withinLimits } from "@/lib/redis/rate-limit";
import { RateLimitError } from "@/server/errors";

export async function requireWithinLimit(ctx: { user: { id: string } }, ...limiters: Ratelimit[]) {
  const allowed = await withinLimits(...limiters.map((limiter): [Ratelimit, string] => [limiter, ctx.user.id]));

  if (!allowed) {
    throw new RateLimitError();
  }
}
