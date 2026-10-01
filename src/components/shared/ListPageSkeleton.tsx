import { Skeleton } from "@/components/ui/skeleton";

export function ListPageSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="mx-auto max-w-300 px-4 py-8 sm:px-8 lg:py-10">
      <span className="sr-only">{label}</span>
      <div aria-hidden>
        <div className="flex items-end justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="mt-3 h-5 w-72 max-w-full" />
          </div>
          <Skeleton className="h-11 w-32 rounded-lg" />
        </div>
        <div className="mt-8 flex gap-2">
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-ink-200 bg-white">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex items-center gap-4 border-b border-ink-200 px-4 py-4 last:border-b-0">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48 max-w-full" />
                <Skeleton className="h-3.5 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="hidden h-4 w-20 md:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
