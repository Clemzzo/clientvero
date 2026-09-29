import type { Metadata } from "next";
import Link from "next/link";

import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResendCodeForm } from "@/components/auth/ResendCodeForm";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { Button } from "@/components/ui/button";
import { getPendingVerificationEmail } from "@/server/auth/pending-verification";
import { planIdSchema } from "@/validators/auth";

export const metadata: Metadata = {
  title: "Verify your email",
};

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  return `${name[0]}•••@${domain}`;
}

export default async function VerifyEmailPage(props: PageProps<"/verify-email">) {
  const email = await getPendingVerificationEmail();

  if (!email) {
    return (
      <AuthShell
        title="Your code has expired"
        description="Sign in again and we'll send you a new code."
        aside={<AuthBrandPanel />}
      >
        <Button asChild className="h-12 w-full rounded-md text-[15px] font-semibold">
          <Link href="/sign-in">Go to sign in</Link>
        </Button>
      </AuthShell>
    );
  }

  const { plan: requestedPlan } = await props.searchParams;
  const planId = planIdSchema.parse(requestedPlan);

  return (
    <AuthShell
      title="Verify your email"
      description={`We sent a 6-digit code to ${maskEmail(email)}.`}
      aside={<AuthBrandPanel />}
    >
      <VerifyEmailForm plan={planId} />
      <ResendCodeForm />

      <p className="mt-3 text-[14px] text-ink-500">
        Wrong email?{" "}
        <Link href="/sign-up" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
          Start again
        </Link>
      </p>
    </AuthShell>
  );
}
