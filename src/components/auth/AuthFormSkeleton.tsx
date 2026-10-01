import { Skeleton } from "@/components/ui/skeleton";

type AuthFormSkeletonProps = {
  fieldCount: number;
};

export function AuthFormSkeleton({ fieldCount }: AuthFormSkeletonProps) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>

      <div aria-hidden className="space-y-5">
        {Array.from({ length: fieldCount }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}

        <Skeleton className="mt-2 h-12 w-full" />
      </div>

      <Skeleton aria-hidden className="mt-6 h-4 w-56" />
    </div>
  );
}
