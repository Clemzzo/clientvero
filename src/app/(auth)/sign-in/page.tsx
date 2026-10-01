import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";
import { auth } from "@/lib/auth/server";
import { pathAfterSignIn } from "@/server/auth/redirect-after-sign-in";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your ClientVero workspace.",
};

export default async function SignInPage(props: PageProps<"/sign-in">) {
  const { next } = await props.searchParams;
  const nextPath = typeof next === "string" ? next : undefined;
  const { data: session } = await auth.getSession();

  if (session?.user) {
    redirect(await pathAfterSignIn(session.user.id, nextPath));
  }

  return (
    <AuthShell title="Welcome back" description="Sign in to your workspace." aside={<AuthBrandPanel />}>
      <SignInForm next={nextPath} />
    </AuthShell>
  );
}
