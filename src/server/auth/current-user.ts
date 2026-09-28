import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";
import { z } from "zod";

import { db } from "@/db";
import { users, type User } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { AuthenticationError } from "@/server/errors";

const sessionUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().min(1),
  name: z.string().nullish(),
  image: z.string().nullish(),
});

type SessionUser = z.infer<typeof sessionUserSchema>;

function splitName(name: SessionUser["name"]) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  const [first, ...rest] = parts;

  return {
    firstName: first?.slice(0, 120) ?? null,
    lastName: rest.join(" ").slice(0, 120) || null,
  };
}

function findUserByAuthId(authUserId: string) {
  return db.query.users.findFirst({
    where: eq(users.authUserId, authUserId),
  });
}

async function findOrProvisionUser(sessionUser: SessionUser): Promise<User> {
  const existing = await findUserByAuthId(sessionUser.id);

  if (existing) {
    return existing;
  }

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
    return created;
  }

  const provisioned = await findUserByAuthId(sessionUser.id);

  if (!provisioned) {
    throw new Error("User could not be provisioned");
  }

  return provisioned;
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const { data: session, error } = await auth.getSession();

  if (error) {
    console.error("[auth] session lookup failed", { code: error.code, status: error.status });
    return null;
  }

  const parsed = sessionUserSchema.safeParse(session?.user);

  return parsed.success ? findOrProvisionUser(parsed.data) : null;
});

export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthenticationError();
  }

  return user;
}
