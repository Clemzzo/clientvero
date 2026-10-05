import "server-only";

import { cache } from "react";
import { and, eq, gt, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { db } from "@/db";
import { clients, organizations, portalAccounts, portalSessions } from "@/db/schema";
import { hashToken } from "@/lib/portal/crypto";
import { portalSlugSchema } from "@/validators/portal";

const SESSION_COOKIE = "cv_portal";
export const PORTAL_SESSION_DAYS = 30;

export type PortalContext = {
  accountId: string;
  email: string;
  client: { id: string; name: string };
  organization: { id: string; name: string; slug: string };
};

export function portalSessionExpiry(from = new Date()): Date {
  return new Date(from.getTime() + PORTAL_SESSION_DAYS * 24 * 60 * 60 * 1000);
}

export async function setPortalSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/portal",
    expires: expiresAt,
  });
}

export async function readPortalSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function clearPortalSessionCookie() {
  (await cookies()).set(SESSION_COOKIE, "", { path: "/portal", maxAge: 0 });
}

export async function findPortalContextByToken(token: string): Promise<PortalContext | null> {
  const [row] = await db
    .select({
      accountId: portalAccounts.id,
      email: portalAccounts.email,
      clientId: clients.id,
      clientName: clients.name,
      organizationId: organizations.id,
      organizationName: organizations.name,
      organizationSlug: organizations.slug,
    })
    .from(portalSessions)
    .innerJoin(portalAccounts, eq(portalAccounts.id, portalSessions.portalAccountId))
    .innerJoin(clients, eq(clients.id, portalAccounts.clientId))
    .innerJoin(organizations, eq(organizations.id, portalAccounts.organizationId))
    .where(
      and(
        eq(portalSessions.tokenHash, hashToken(token)),
        gt(portalSessions.expiresAt, new Date()),
        eq(portalSessions.organizationId, portalAccounts.organizationId),
        eq(portalAccounts.status, "ACTIVE"),
        eq(clients.organizationId, portalAccounts.organizationId),
        eq(clients.portalEnabled, true),
        isNull(clients.deletedAt),
        isNull(organizations.deletedAt),
      ),
    )
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    accountId: row.accountId,
    email: row.email,
    client: { id: row.clientId, name: row.clientName },
    organization: { id: row.organizationId, name: row.organizationName, slug: row.organizationSlug },
  };
}

const loadPortalContext = cache(async (): Promise<PortalContext | null> => {
  const token = await readPortalSessionToken();
  return token ? findPortalContextByToken(token) : null;
});

export async function getPortalContext(slug: string): Promise<PortalContext | null> {
  const context = await loadPortalContext();
  return context?.organization.slug === slug ? context : null;
}

export async function requirePortalContext(slug: string): Promise<PortalContext> {
  const parsedSlug = portalSlugSchema.safeParse(slug);

  if (!parsedSlug.success) {
    notFound();
  }

  const context = await getPortalContext(parsedSlug.data);

  if (!context) {
    redirect(`/portal/${parsedSlug.data}/sign-in`);
  }

  return context;
}
