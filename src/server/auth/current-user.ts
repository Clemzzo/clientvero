import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";
import { z } from "zod";

import { db } from "@/db";
import { users, type Organization, type OrganizationMember, type User } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { AuthenticationError } from "@/server/errors";

const sessionUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().min(1),
  name: z.string().nullish(),
  image: z.string().nullish(),
});

type SessionUser = z.infer<typeof sessionUserSchema>;

export type Membership = OrganizationMember & { organization: Organization };

export type CurrentAccount = {
  user: User;
  membership: Membership | null;
};

function splitName(name: SessionUser["name"]) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  const [first, ...rest] = parts;

  return {
    firstName: first?.slice(0, 120) ?? null,
    lastName: rest.join(" ").slice(0, 120) || null,
  };
}

async function findAccount(authUserId: string): Promise<CurrentAccount | null> {
  const row = await db.query.users.findFirst({
    where: eq(users.authUserId, authUserId),
    with: {
      organizationMemberships: {
        with: { organization: true },
        limit: 1,
      },
    },
  });

  if (!row) {
    return null;
  }

  const { organizationMemberships, ...user } = row;
  return { user, membership: organizationMemberships[0] ?? null };
}

async function provisionAccount(sessionUser: SessionUser): Promise<CurrentAccount> {
  const [created] = await db
    .insert(users)
    .values({
      authUserId: sessionUser.id,
      email: sessionUser.email.toLowerCase(),
      avatarUrl: sessionUser.image ?? null,
      ...splitName(sessionUser.name),
    })
    .onConflictDoNothing({ target: users.authUserId })
    .returning();

  if (created) {
    return { user: created, membership: null };
  }

  const existing = await findAccount(sessionUser.id);

  if (!existing) {
    throw new Error("User could not be provisioned");
  }

  return existing;
}

export const getCurrentAccount = cache(async (): Promise<CurrentAccount | null> => {
  const { data: session, error } = await auth.getSession();

  if (error) {
    console.error("[auth] session lookup failed", { code: error.code, status: error.status });
    return null;
  }

  const parsed = sessionUserSchema.safeParse(session?.user);

  if (!parsed.success) {
    return null;
  }

  return (await findAccount(parsed.data.id)) ?? provisionAccount(parsed.data);
});

export async function requireCurrentAccount(): Promise<CurrentAccount> {
  const account = await getCurrentAccount();

  if (!account) {
    throw new AuthenticationError();
  }

  return account;
}
