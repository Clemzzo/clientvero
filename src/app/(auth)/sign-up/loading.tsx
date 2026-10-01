import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";
import { AuthShell } from "@/components/auth/AuthShell";
import { Skeleton } from "@/components/ui/skeleton";

export default function SignUpLoading() {
  return (
    <AuthShell
      title="Create your account"
      description={<Skeleton className="h-5 w-72 max-w-full" />}
      aside={<AuthBrandPanel />}
    >
      <AuthFormSkeleton fieldCount={3} />
    </AuthShell>
  );
}
