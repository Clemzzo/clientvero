import "server-only";

import { Bachs, BachsApiError } from "@bachs/sdk";

import { bachsConfig } from "@/lib/bachs/config";

const apiBaseUrl = {
  sandbox: "https://sandbox-api.bachs.io",
  production: "https://api.bachs.io",
} as const;

let client: { apiKey: string; bachs: Bachs } | undefined;

export function bachsClient(): Bachs {
  const { apiKey } = bachsConfig();

  if (client?.apiKey !== apiKey) {
    client = { apiKey, bachs: new Bachs({ apiKey }) };
  }

  return client.bachs;
}

export async function changeSubscriptionProduct(subscriptionId: string, productId: string): Promise<void> {
  const bachs = bachsClient();
  const { apiKey } = bachsConfig();
  const response = await fetch(`${apiBaseUrl[bachs.environment]}/v1/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: productId, proration_behavior: "invoice_now" }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new BachsApiError(response.status, body, response.headers.get("x-request-id") ?? undefined);
  }
}
