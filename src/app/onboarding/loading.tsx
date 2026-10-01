import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";
import { AuthShell } from "@/components/auth/AuthShell";

export default function OnboardingLoading() {
  return (
    <AuthShell title="Set up your workspace" description="It takes less than a minute." aside={<AuthBrandPanel />}>
      <AuthFormSkeleton fieldCount={2} />
    </AuthShell>
  );
}
