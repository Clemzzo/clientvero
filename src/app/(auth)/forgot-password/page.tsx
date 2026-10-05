import type { Metadata } from "next";

import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset the password for your ClientVero workspace.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot your password?"
      description="Enter the email you sign in with and we'll send you a link to choose a new one."
      aside={<AuthBrandPanel />}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
