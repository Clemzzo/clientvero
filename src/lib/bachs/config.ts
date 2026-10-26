import "server-only";

import { z } from "zod";

import type { PlanId } from "@/features/subscriptions/plans";

export type PaidPlanId = Exclude<PlanId, "free">;

const bachsEnvSchema = z.object({
  BACHS_API_KEY: z.string().regex(/^sk_(sandbox|live)_/, "must be a Bachs secret key (sk_sandbox_… or sk_live_…)"),
  BACHS_WEBHOOK_SECRET: z.string().min(1),
  BACHS_PRODUCT_PRO: z.string().startsWith("prod_"),
  BACHS_PRODUCT_AGENCY: z.string().startsWith("prod_"),
});

export type BachsConfig = {
  apiKey: string;
  webhookSecret: string;
  products: Record<PaidPlanId, string>;
};

export class BachsNotConfiguredError extends Error {
  constructor(problems: string) {
    super(`Bachs is not configured. Check .env.local:\n${problems}`);
    this.name = "BachsNotConfiguredError";
  }
}

export function bachsConfig(): BachsConfig {
  const parsed = bachsEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new BachsNotConfiguredError(
      parsed.error.issues.map((issue) => `  ${issue.path.join(".")}: ${issue.message}`).join("\n"),
    );
  }

  const env = parsed.data;
  return {
    apiKey: env.BACHS_API_KEY,
    webhookSecret: env.BACHS_WEBHOOK_SECRET,
    products: { pro: env.BACHS_PRODUCT_PRO, agency: env.BACHS_PRODUCT_AGENCY },
  };
}

export function planForProduct(config: BachsConfig, productId: string): PaidPlanId | null {
  const match = (Object.keys(config.products) as PaidPlanId[]).find((plan) => config.products[plan] === productId);
  return match ?? null;
}
