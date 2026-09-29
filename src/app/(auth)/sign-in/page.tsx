import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";
import { auth } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your ClientVero workspace.",
};

export default async function SignInPage(props: PageProps<"/sign-in">) {
  const { data: session } = await auth.getSession();

  if (session?.user) {
    redirect("/app");
  }

  const { next } = await props.searchParams;

  return (
    <AuthShell title="Welcome back" description="Sign in to your workspace." aside={<AuthBrandPanel />}>
      <SignInForm next={typeof next === "string" ? next : undefined} />
    </AuthShell>
  );
}
