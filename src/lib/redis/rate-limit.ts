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
  resetRequestPerIp: limiter("reset-request:ip", 5, "1 h"),
  resetRequestPerEmailBurst: limiter("reset-request:email:burst", 1, "60 s"),
  resetRequestPerEmail: limiter("reset-request:email", 3, "1 h"),
  resetSubmitPerIp: limiter("reset-submit:ip", 5, "10 m"),
};

export const workspaceLimits = {
  writesPerUser: limiter("workspace:writes:user", 10, "1 m"),
  conversionsPerUser: limiter("workspace:convert:user", 5, "1 m"),
  messagesPerUser: limiter("workspace:messages:user", 60, "1 m"),
  messagePollsPerUser: limiter("workspace:message-polls:user", 120, "1 m"),
  uploadsPerUser: limiter("workspace:uploads:user", 40, "1 m"),
};

export const portalLimits = {
  authPerIp: limiter("portal:auth:ip", 10, "15 m"),
  authPerEmail: limiter("portal:auth:email", 5, "15 m"),
  messagesPerAccount: limiter("portal:messages:account", 60, "1 m"),
  messagePollsPerAccount: limiter("portal:message-polls:account", 120, "1 m"),
};

export const publicLimits = {
  documentActionsPerIp: limiter("public:document:ip", 30, "1 m"),
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
