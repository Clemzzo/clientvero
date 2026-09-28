import "server-only";

import { cookies } from "next/headers";

import { emailSchema } from "@/validators/auth";

const cookieName = "cv_pending_verification";
const maxAgeSeconds = 15 * 60;

export async function setPendingVerificationEmail(email: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(cookieName, email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function getPendingVerificationEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const parsed = emailSchema.safeParse(cookieStore.get(cookieName)?.value);

  return parsed.success ? parsed.data : null;
}

export async function clearPendingVerificationEmail(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}
