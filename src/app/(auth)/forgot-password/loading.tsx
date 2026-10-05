import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ForgotPasswordLoading() {
  return (
    <AuthShell
      title="Forgot your password?"
      description="Enter the email you sign in with and we'll send you a link to choose a new one."
      aside={<AuthBrandPanel />}
    >
      <AuthFormSkeleton fieldCount={1} />
    </AuthShell>
  );
}
