import "server-only";

import { safeRedirectPath } from "@/lib/utils/safe-redirect";
import { hasWorkspace } from "@/server/services/organization.service";

export async function pathAfterSignIn(authUserId: string, next?: string): Promise<string> {
  if (await hasWorkspace(authUserId)) {
    return safeRedirectPath(next, "/app");
  }

  return "/onboarding";
}
