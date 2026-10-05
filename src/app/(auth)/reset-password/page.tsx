import type { Metadata } from "next";
import Link from "next/link";

import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

function usableToken(token: string | string[] | undefined) {
  return typeof token === "string" && token.length > 0 && token.length <= 512 && token !== "INVALID_TOKEN"
    ? token
    : null;
}

export default async function ResetPasswordPage(props: PageProps<"/reset-password">) {
  const token = usableToken((await props.searchParams).token);

  if (!token) {
    return (
      <AuthShell
        title="This link has expired"
        description="Password reset links work once and expire after 15 minutes. Request a new one to continue."
        aside={<AuthBrandPanel />}
      >
        <Button asChild className="h-12 w-full rounded-md text-[15px] font-semibold">
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" description="Pick something you haven't used here before." aside={<AuthBrandPanel />}>
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
