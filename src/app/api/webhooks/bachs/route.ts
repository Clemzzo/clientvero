import { handleBachsWebhook } from "@/server/services/bachs-webhook.service";

export async function POST(request: Request) {
  try {
    const { status, body } = await handleBachsWebhook(await request.text(), request.headers);
    return new Response(body, { status, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[billing] webhook failed", error instanceof Error ? error.message : error);
    return new Response("error", { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
