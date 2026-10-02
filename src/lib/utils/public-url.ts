import "server-only";

import { env } from "@/lib/env";

export function proposalPublicUrl(publicId: string) {
  return new URL(`/proposal/${publicId}`, env.NEXT_PUBLIC_APP_URL).toString();
}
