import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";
import { AuthShell } from "@/components/auth/AuthShell";

export default function SignInLoading() {
  return (
    <AuthShell title="Welcome back" description="Sign in to your workspace." aside={<AuthBrandPanel />}>
      <AuthFormSkeleton fieldCount={2} />
    </AuthShell>
  );
}
