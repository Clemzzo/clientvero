import "server-only";

import type { Organization, User } from "@/db/schema";
import { requireCurrentAccount, type Membership } from "@/server/auth/current-user";
import { AuthorizationError } from "@/server/errors";

export type OrganizationContext = {
  user: User;
  organization: Organization;
  membership: Membership;
};

export async function requireOrganizationContext(): Promise<OrganizationContext> {
  const { user, membership } = await requireCurrentAccount();

  if (!membership) {
    throw new AuthorizationError("Create your workspace to continue.");
  }

  return { user, organization: membership.organization, membership };
}

export type WorkspaceActor = Pick<OrganizationContext, "user" | "organization">;
