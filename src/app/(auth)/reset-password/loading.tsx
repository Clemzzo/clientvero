import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ResetPasswordLoading() {
  return (
    <AuthShell title="Choose a new password" description="Pick something you haven't used here before." aside={<AuthBrandPanel />}>
      <AuthFormSkeleton fieldCount={2} />
    </AuthShell>
  );
}
