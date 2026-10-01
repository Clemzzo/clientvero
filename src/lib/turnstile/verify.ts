import "server-only";

import { z } from "zod";

import { env } from "@/lib/env";
import type { TurnstileAction } from "@/types/turnstile";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const siteverifyResponseSchema = z.object({
  success: z.boolean(),
  action: z.string().optional(),
  hostname: z.string().optional(),
  "error-codes": z.array(z.string()).optional(),
});

export async function verifyTurnstile(token: string, action: TurnstileAction, ip: string): Promise<boolean> {
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token });

  if (ip !== "unknown") {
    body.set("remoteip", ip);
  }

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`siteverify returned ${response.status}`);
    }

    const result = siteverifyResponseSchema.parse(await response.json());

    if (!result.success) {
      console.warn("[turnstile] rejected", { action, errorCodes: result["error-codes"] });
      return false;
    }

    return result.action === action && env.TURNSTILE_HOSTNAMES.includes(result.hostname ?? "");
  } catch (error) {
    console.error("[turnstile] verification unavailable", error instanceof Error ? error.message : error);
    return false;
  }
}
