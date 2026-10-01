import { Skeleton } from "@/components/ui/skeleton";

export function DetailPageSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <span className="sr-only">{label}</span>
      <div aria-hidden>
        <Skeleton className="h-4 w-16" />
        <Skeleton className="mt-5 h-8 w-64 max-w-full" />
        <Skeleton className="mt-3 h-5 w-40" />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
