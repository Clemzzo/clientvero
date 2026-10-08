import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/db";
import { portalAccounts, portalSetupTokens, type Organization, type User } from "@/db/schema";
import { hashToken } from "@/lib/portal/crypto";
import { ConflictError, NotFoundError, ValidationError } from "@/server/errors";
import { createClient } from "@/server/services/client.service";
import {
  getOpenPortalLink,
  invitePortalClient,
  issuePortalLink,
  revokePortalAccess,
} from "@/server/services/portal-access.service";
import { cleanup, createTestOrganization, createTestUser } from "@/test/fixtures";

const clientInput = {
  name: "Acme Co.",
  phone: null,
  company: "Acme",
  website: null,
  address: null,
  country: "NG",
  notes: null,
};

function tokenOf(url: string) {
  return url.split("/").at(-1)!;
}

describe("recopying portal setup links", () => {
  let user: User;
  let orgA: Organization;
  let orgB: Organization;

  const ctxA = () => ({ user, organization: orgA });

  async function invitedAccount(email: string) {
    const clientId = await createClient(ctxA(), { ...clientInput, email });
    const url = await invitePortalClient(ctxA(), clientId);
    const [account] = await db.select({ id: portalAccounts.id }).from(portalAccounts).where(eq(portalAccounts.clientId, clientId));
    return { accountId: account.id, url };
  }

  beforeAll(async () => {
    [user, orgA, orgB] = await Promise.all([createTestUser(), createTestOrganization(), createTestOrganization()]);
  });

  afterAll(async () => {
    await cleanup({ organizationIds: [orgA.id, orgB.id], userIds: [user.id] });
  });

  it("returns the same link that was just created", async () => {
    const { accountId, url } = await invitedAccount("invite@acme.com");

    expect(await getOpenPortalLink(ctxA(), accountId)).toBe(url);
  });

  it("returns only the newest link, and forgets replaced ones", async () => {
    const { accountId, url: first } = await invitedAccount("reissue@acme.com");
    const second = await issuePortalLink(ctxA(), accountId);

    expect(await getOpenPortalLink(ctxA(), accountId)).toBe(second);

    const [old] = await db
      .select({ tokenSealed: portalSetupTokens.tokenSealed })
      .from(portalSetupTokens)
      .where(eq(portalSetupTokens.tokenHash, hashToken(tokenOf(first))));
    expect(old.tokenSealed).toBeNull();
  });

  it("refuses when the link was used or access was revoked", async () => {
    const used = await invitedAccount("used@acme.com");
    await db.update(portalSetupTokens).set({ usedAt: new Date() }).where(eq(portalSetupTokens.portalAccountId, used.accountId));
    await expect(getOpenPortalLink(ctxA(), used.accountId)).rejects.toBeInstanceOf(ConflictError);

    const revoked = await invitedAccount("revoked@acme.com");
    await revokePortalAccess(ctxA(), revoked.accountId);
    await expect(getOpenPortalLink(ctxA(), revoked.accountId)).rejects.toBeInstanceOf(ValidationError);
  });

  it("does not reveal another organization's link", async () => {
    const { accountId } = await invitedAccount("tenant@acme.com");

    await expect(getOpenPortalLink({ user, organization: orgB }, accountId)).rejects.toBeInstanceOf(NotFoundError);
  });
});
