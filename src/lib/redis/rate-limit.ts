import "server-only";

import { Ratelimit, type Duration } from "@upstash/ratelimit";

import { redis } from "@/lib/redis/client";

function limiter(name: string, requests: number, window: Duration) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `ratelimit:${name}`,
    timeout: 2000,
  });
}

export const authLimits = {
  signInPerIp: limiter("sign-in:ip", 10, "15 m"),
  signInPerEmail: limiter("sign-in:email", 5, "15 m"),
  signUpPerIp: limiter("sign-up:ip", 5, "1 h"),
  verifyPerIp: limiter("verify:ip", 10, "15 m"),
  verifyPerEmail: limiter("verify:email", 10, "15 m"),
  resendPerIp: limiter("resend:ip", 5, "1 h"),
  resendPerEmailBurst: limiter("resend:email:burst", 1, "60 s"),
  resendPerEmail: limiter("resend:email", 5, "1 h"),
};

type LimitCheck = [Ratelimit, string];

export async function withinLimits(...checks: LimitCheck[]): Promise<boolean> {
  try {
    const results = await Promise.all(checks.map(([ratelimit, key]) => ratelimit.limit(key)));
    return results.every((result) => result.success);
  } catch (error) {
    console.error("[rate-limit] unavailable", error instanceof Error ? error.message : error);
    return true;
  }
}
